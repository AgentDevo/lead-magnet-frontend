'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TEMPLATES } from '@/lib/templates';
import { magnetApi } from '@/lib/api-client';
import { useToast } from '@/components/providers/toast-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function TemplatesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [creating, setCreating] = useState<string | null>(null);

  const handleUse = async (templateId: string) => {
    const tpl = TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    setCreating(templateId);
    try {
      const res = await magnetApi.create({
        title: tpl.title,
        description: tpl.description,
        magnetType: tpl.type,
        content: tpl.content,
      });
      toast({ type: 'success', title: 'Lead magnet created from template' });
      router.push(`/lead-magnets/${res.data.data.id}`);
    } catch {
      toast({ type: 'error', title: 'Failed to create lead magnet' });
      setCreating(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <button onClick={() => router.push('/lead-magnets')} className="hover:text-foreground transition-colors">
            Lead Magnets
          </button>
          <span>/</span>
          <span>Templates</span>
        </div>
        <h1 className="text-2xl font-bold">Starter Templates</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Pick a template to create a ready-to-publish lead magnet in one click.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {TEMPLATES.map((tpl) => (
          <Card key={tpl.id} className="flex flex-col">
            <CardContent className="pt-5 pb-4 flex flex-col flex-1">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl">{tpl.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-tight">{tpl.title}</p>
                  <span className="inline-block mt-1 text-xs font-mono bg-secondary px-1.5 py-0.5 rounded capitalize">
                    {tpl.type}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground flex-1 mb-4">{tpl.description}</p>
              <Button
                size="sm"
                className="w-full"
                loading={creating === tpl.id}
                onClick={() => handleUse(tpl.id)}
              >
                Use this template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
