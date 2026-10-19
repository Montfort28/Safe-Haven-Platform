'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Overview {
  periodDays: number;
  totalAccounts: number;
  newAccounts: number | null;
  activeAccounts: number | null;
  featureUse: {
    moodCheckIns: number | null;
    journalEntries: number | null;
    completedActivities: number | null;
    resourceVisits: number | null;
  };
  content: {
    activeAffirmations: number;
    resourceCatalog: string;
  };
  operations: {
    database: string;
    apiErrorTracking: string;
    backupMonitoring: string;
    deploymentHistory: string;
  };
}

interface Registry {
  total: number;
  page: number;
  pageCount: number;
  accounts: { accountNumber: number; registeredAt: string }[];
}

interface Affirmation {
  id: string;
  content: string;
  active: boolean;
  createdAt: string;
}

const countLabel = (value: number | null) =>
  value === null ? 'Suppressed (<5)' : value.toLocaleString();

export default function AdminPage() {
  const router = useRouter();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [registry, setRegistry] = useState<Registry | null>(null);
  const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
  const [newAffirmation, setNewAffirmation] = useState('');
  const [contentError, setContentError] = useState('');
  const [savingContent, setSavingContent] = useState(false);
  const [days, setDays] = useState(30);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [overviewResponse, registryResponse, contentResponse] = await Promise.all([
        fetch(`/api/admin/overview?days=${days}`, { cache: 'no-store' }),
        fetch(`/api/admin/registry?page=${page}`, { cache: 'no-store' }),
        fetch('/api/admin/content', { cache: 'no-store' }),
      ]);
      if ([overviewResponse, registryResponse, contentResponse].some(response => response.status === 401)) {
        router.replace('/admin/login');
        return;
      }
      if (!overviewResponse.ok || !registryResponse.ok || !contentResponse.ok) {
        throw new Error('Admin information could not be loaded. Please try again.');
      }
      const [overviewResult, registryResult, contentResult] = await Promise.all([
        overviewResponse.json(),
        registryResponse.json(),
        contentResponse.json(),
      ]);
      setOverview(overviewResult.data);
      setRegistry(registryResult.data);
      setAffirmations(contentResult.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Admin information could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [days, page, router]);

  useEffect(() => {
    void loadAdminData();
  }, [loadAdminData]);

  async function logout() {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.replace('/admin/login');
  }

  async function addAffirmation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setContentError('');
    setSavingContent(true);
    try {
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newAffirmation }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not add affirmation.');
      setNewAffirmation('');
      setAffirmations(items => [result.data, ...items]);
    } catch (contentFailure) {
      setContentError(contentFailure instanceof Error ? contentFailure.message : 'Could not add affirmation.');
    } finally {
      setSavingContent(false);
    }
  }

  async function setAffirmationActive(affirmation: Affirmation, active: boolean) {
    setContentError('');
    try {
      const response = await fetch('/api/admin/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: affirmation.id, active }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not update affirmation.');
      setAffirmations(items => items.map(item => item.id === affirmation.id ? result.data : item));
    } catch (contentFailure) {
      setContentError(contentFailure instanceof Error ? contentFailure.message : 'Could not update affirmation.');
    }
  }

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <span className="admin-eyebrow">Safe Haven · Administration</span>
          <h1>Platform overview</h1>
          <p>Service and aggregate usage only. Private user details are not available here.</p>
        </div>
        <button className="admin-logout" onClick={logout}>Sign out</button>
      </header>

      {error && <p className="admin-error" role="alert">{error}</p>}
      {loading && <p className="admin-loading" role="status">Loading admin overview…</p>}

      {overview && (
        <>
          <section className="admin-section">
            <div className="admin-section-heading">
              <div>
                <h2>Overview</h2>
                <p>Aggregate activity for the selected reporting period.</p>
              </div>
              <label>
                <span className="sr-only">Reporting period</span>
                <select value={days} onChange={event => { setPage(1); setDays(Number(event.target.value)); }}>
                  <option value={7}>Last 7 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 90 days</option>
                </select>
              </label>
            </div>
            <div className="admin-metrics-grid">
              <Metric label="Registered accounts" value={overview.totalAccounts.toLocaleString()} note="All accounts ever registered" />
              <Metric label="New accounts" value={countLabel(overview.newAccounts)} note={`Last ${days} days`} />
              <Metric label="Active accounts" value={countLabel(overview.activeAccounts)} note={`Used at least one feature · last ${days} days`} />
              <Metric label="Mood check-ins" value={countLabel(overview.featureUse.moodCheckIns)} note={`Aggregate count · last ${days} days`} />
              <Metric label="Journal entries" value={countLabel(overview.featureUse.journalEntries)} note={`Count only; entry content is never accessed`} />
              <Metric label="Completed activities" value={countLabel(overview.featureUse.completedActivities)} note={`Aggregate count · last ${days} days`} />
              <Metric label="Resource visits" value={countLabel(overview.featureUse.resourceVisits)} note={`Aggregate count · last ${days} days`} />
            </div>
            <p className="admin-privacy-note">
              Counts below five are suppressed to reduce identification risk. No names, emails, usernames,
              account IDs, mood values, or journal text are returned by the overview API.
            </p>
          </section>

          <section className="admin-section">
            <div className="admin-section-heading">
              <div>
                <h2>Registered accounts</h2>
                <p>An anonymized registry. Rows contain only an ordinal and registration date.</p>
              </div>
              <span className="admin-total">{registry?.total.toLocaleString() ?? '—'} total</span>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Account</th><th>Registered</th></tr></thead>
                <tbody>
                  {registry?.accounts.map(account => (
                    <tr key={account.accountNumber}>
                      <td>Account {account.accountNumber}</td>
                      <td>{new Date(account.registeredAt).toLocaleString()}</td>
                    </tr>
                  ))}
                  {registry?.accounts.length === 0 && (
                    <tr><td colSpan={2}>No accounts registered yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {registry && registry.pageCount > 1 && (
              <div className="admin-pagination">
                <button disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Previous</button>
                <span>Page {registry.page} of {registry.pageCount}</span>
                <button disabled={page >= registry.pageCount} onClick={() => setPage(value => value + 1)}>Next</button>
              </div>
            )}
          </section>

          <div className="admin-two-column">
            <section className="admin-section">
              <h2>Content management</h2>
              <p className="admin-muted">Manage affirmation text shown in Safe Haven. This does not expose user-submitted content.</p>
              {contentError && <p className="admin-error" role="alert">{contentError}</p>}
              <form className="admin-content-form" onSubmit={addAffirmation}>
                <label htmlFor="new-affirmation">Add an affirmation</label>
                <textarea
                  id="new-affirmation"
                  value={newAffirmation}
                  onChange={event => setNewAffirmation(event.target.value)}
                  minLength={3}
                  maxLength={500}
                  required
                />
                <button disabled={savingContent}>{savingContent ? 'Saving…' : 'Add affirmation'}</button>
              </form>
              <ul className="admin-affirmation-list">
                {affirmations.map(affirmation => (
                  <li key={affirmation.id}>
                    <span>{affirmation.content}</span>
                    <button
                      className={affirmation.active ? 'is-active' : ''}
                      onClick={() => void setAffirmationActive(affirmation, !affirmation.active)}
                      aria-pressed={affirmation.active}
                    >
                      {affirmation.active ? 'Published' : 'Inactive'}
                    </button>
                  </li>
                ))}
              </ul>
              <p className="admin-muted">{overview.content.resourceCatalog} External resource review dates and editing are not yet managed here.</p>
            </section>
            <section className="admin-section">
              <h2>Service and data operations</h2>
              <dl className="admin-status-list">
                <div><dt>Database</dt><dd>{overview.operations.database}</dd></div>
                <div><dt>API error tracking</dt><dd>{overview.operations.apiErrorTracking}</dd></div>
                <div><dt>Backup monitoring</dt><dd>{overview.operations.backupMonitoring}</dd></div>
                <div><dt>Deployment history</dt><dd>{overview.operations.deploymentHistory}</dd></div>
              </dl>
              <p className="admin-muted">Unavailable telemetry is marked as not configured rather than estimated.</p>
            </section>
          </div>
        </>
      )}
    </main>
  );
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className="admin-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}
