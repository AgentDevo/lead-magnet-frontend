'use client';
import { useState, useEffect, useCallback } from 'react';
import { analyticsApi, PageAnalytics, AnalyticsTotals, UtmSource } from '@/lib/api-client';
import { useToast } from '@/components/providers/toast-provider';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const BASE_URL = 'http://192.168.1.241:3002';

function ConversionBar({ rate }: { rate: number }) {
  const color = rate >= 20 ? 'bg-green-500' : rate >= 10 ? 'bg-yellow-500' : 'bg-muted-foreground/30';
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(rate, 100)}%` }} />
      </div>
      <span className="text-sm tabular-nums">{rate.toFixed(1)}%</span>
    </div>
  );
}

function SourceBar({ count, max }: { count: number; max: number }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { toast } = useToast();
  const [pages, setPages] = useState<PageAnalytics[]>([]);
  const [totals, setTotals] = useState<AnalyticsTotals>({ views: 0, leads: 0 });
  const [sources, setSources] = useState<UtmSource[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    analyticsApi.get()
      .then((res) => {
        setPages(res.data.data.pages);
        setTotals(res.data.data.totals);
        setSources(res.data.data.sources ?? []);
      })
      .catch(() => toast({ type: 'error', title: 'Failed to load analytics' }))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const overallConversion = totals.views > 0
    ? Math.round((totals.leads / totals.views) * 1000) / 10
    : 0;

  const maxSourceCount = sources[0]?.count ?? 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Page views and conversions across all landing pages</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card><CardContent className="pt-5 pb-4">
              <p className="text-3xl font-bold">{totals.views.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">Total page views</p>
            </CardContent></Card>
            <Card><CardContent className="pt-5 pb-4">
              <p className="text-3xl font-bold">{totals.leads.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">Total leads</p>
            </CardContent></Card>
            <Card><CardContent className="pt-5 pb-4">
              <p className="text-3xl font-bold">{overallConversion.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground mt-1">Overall conversion</p>
            </CardContent></Card>
          </div>

          {pages.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-4xl mb-4">📊</p>
                <p className="font-medium mb-1">No data yet</p>
                <p className="text-sm text-muted-foreground mb-6">Publish a landing page and share it to start seeing analytics.</p>
                <Link href="/landing-pages/new" className="text-sm text-accent underline">Create a landing page</Link>
              </CardContent>
            </Card>
          ) : (
            <div className="flex gap-6 items-start">
              <div className="flex-1 min-w-0">
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/50 text-muted-foreground">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium">Landing page</th>
                        <th className="text-left px-4 py-3 font-medium">Status</th>
                        <th className="text-right px-4 py-3 font-medium">Views</th>
                        <th className="text-right px-4 py-3 font-medium">Leads</th>
                        <th className="text-left px-4 py-3 font-medium pl-6">Conversion</th>
                        <th className="text-left px-4 py-3 font-medium">Top source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {pages.map((page) => (
                        <tr key={page.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="px-4 py-3">
                            <Link href={`/landing-pages/${page.id}`} className="font-medium hover:underline">
                              {page.title}
                            </Link>
                            <div className="text-xs text-muted-foreground font-mono">
                              {page.is_published ? (
                                <a href={`${BASE_URL}/p/${page.slug}`} target="_blank" rel="noreferrer" className="hover:text-foreground">
                                  /p/{page.slug}
                                </a>
                              ) : `/p/${page.slug}`}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={page.is_published ? 'success' : 'secondary'}>
                              {page.is_published ? 'Published' : 'Draft'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums">{page.views.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right tabular-nums">{page.leads.toLocaleString()}</td>
                          <td className="px-4 py-3 pl-6">
                            <ConversionBar rate={page.conversion_rate} />
                          </td>
                          <td className="px-4 py-3">
                            {page.top_source ? (
                              <span className="text-xs font-mono bg-secondary px-1.5 py-0.5 rounded">{page.top_source}</span>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {sources.length > 0 && (
                <div className="w-56 shrink-0">
                  <Card>
                    <CardHeader className="pb-2 pt-4">
                      <CardTitle className="text-sm">Top Sources</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4 space-y-2.5">
                      {sources.map((s) => (
                        <div key={s.source} className="flex items-center gap-2 text-sm">
                          <span className="font-mono text-xs text-muted-foreground w-20 truncate">{s.source}</span>
                          <SourceBar count={s.count} max={maxSourceCount} />
                          <span className="tabular-nums text-xs w-8 text-right">{s.count}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
