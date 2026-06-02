'use client';
import { useState, useEffect, useCallback } from 'react';
import { landingPageApi, leadsApi, LandingPage, Lead } from '@/lib/api-client';
import { useToast } from '@/components/providers/toast-provider';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent } from '@/components/ui/card';
import { Select } from '@/components/ui/select';

function exportCsv(leads: Lead[]) {
  const headers = ['Email', 'Full Name', 'Landing Page', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'GDPR', 'Date'];
  const rows = leads.map((l) => [
    l.email,
    l.full_name ?? '',
    l.landing_page?.title ?? l.landing_page_id,
    l.utm_source ?? '',
    l.utm_medium ?? '',
    l.utm_campaign ?? '',
    l.gdpr_consent ? 'yes' : 'no',
    new Date(l.created_at).toISOString(),
  ]);
  const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function LeadsPage() {
  const { toast } = useToast();
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterPageId, setFilterPageId] = useState('');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    landingPageApi.list().then((res) => setPages(res.data.data.pages)).catch(() => {});
  }, []);

  const load = useCallback((pageId: string, page: number) => {
    setLoading(true);
    leadsApi.list({ pageId: pageId || undefined, page, limit: 50 })
      .then((res) => {
        setLeads(res.data.data.leads);
        setTotal(res.data.data.total);
      })
      .catch(() => toast({ type: 'error', title: 'Failed to load leads' }))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => { load(filterPageId, currentPage); }, [load, filterPageId, currentPage]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterPageId(e.target.value);
    setCurrentPage(1);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const first = await leadsApi.list({ pageId: filterPageId || undefined, page: 1, limit: 50 });
      const { total: t, limit } = first.data.data;
      let all: Lead[] = first.data.data.leads;
      const totalPages = Math.ceil(t / limit);
      for (let p = 2; p <= totalPages; p++) {
        const r = await leadsApi.list({ pageId: filterPageId || undefined, page: p, limit: 50 });
        all = all.concat(r.data.data.leads);
      }
      exportCsv(all);
    } catch {
      toast({ type: 'error', title: 'Export failed' });
    } finally {
      setExporting(false);
    }
  };

  const pageOptions = [
    { value: '', label: 'All landing pages' },
    ...pages.map((p) => ({ value: p.id, label: p.title })),
  ];

  const today = new Date().toDateString();
  const todayCount = leads.filter((l) => new Date(l.created_at).toDateString() === today).length;
  const thisWeek = leads.filter((l) => (Date.now() - new Date(l.created_at).getTime()) < 7 * 24 * 60 * 60 * 1000).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{total} total captured</p>
        </div>
        <Button variant="outline" loading={exporting} onClick={handleExport} disabled={total === 0}>
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card><CardContent className="pt-5 pb-4">
          <p className="text-3xl font-bold">{total}</p>
          <p className="text-sm text-muted-foreground mt-1">Total leads</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5 pb-4">
          <p className="text-3xl font-bold">{todayCount}</p>
          <p className="text-sm text-muted-foreground mt-1">Today</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5 pb-4">
          <p className="text-3xl font-bold">{thisWeek}</p>
          <p className="text-sm text-muted-foreground mt-1">This week</p>
        </CardContent></Card>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-64">
          <Select options={pageOptions} value={filterPageId} onChange={handleFilterChange} />
        </div>
        <span className="text-sm text-muted-foreground">{total} result{total !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
      ) : leads.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-4xl mb-4">📭</p>
            <p className="font-medium mb-1">No leads yet</p>
            <p className="text-sm text-muted-foreground">Publish a landing page and share it to start capturing leads.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Email</th>
                  <th className="text-left px-4 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium">Landing page</th>
                  <th className="text-left px-4 py-3 font-medium">Source</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{lead.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{lead.full_name ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{lead.landing_page?.title ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {lead.utm_source
                        ? <span className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded">{lead.utm_source}</span>
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(lead.created_at).toLocaleDateString()}{' '}
                      {new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {total > 50 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {Math.ceil(total / 50)}
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>Previous</Button>
                <Button size="sm" variant="outline" disabled={currentPage >= Math.ceil(total / 50)} onClick={() => setCurrentPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
