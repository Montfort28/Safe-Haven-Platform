import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isAdminRequest } from '@/lib/adminAuth';
import { prisma } from '@/lib/db';

const querySchema = z.object({
  page: z.coerce.number().int().min(1).max(1_000_000).default(1),
});
const PAGE_SIZE = 50;

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 401 });
  }

  const parsed = querySchema.safeParse({
    page: request.nextUrl.searchParams.get('page') ?? 1,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid page.' }, { status: 400 });
  }

  try {
    const page = parsed.data.page;
    const [total, registered] = await Promise.all([
      prisma.user.count(),
      prisma.user.findMany({
        select: { createdAt: true },
        orderBy: [{ createdAt: 'asc' }],
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        total,
        page,
        pageSize: PAGE_SIZE,
        pageCount: Math.ceil(total / PAGE_SIZE),
        accounts: registered.map((account, index) => ({
          accountNumber: (page - 1) * PAGE_SIZE + index + 1,
          registeredAt: account.createdAt,
        })),
      },
    }, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    console.error('Admin registered-account query failed:', error);
    return NextResponse.json({ error: 'Could not load the account registry.' }, { status: 500 });
  }
}
