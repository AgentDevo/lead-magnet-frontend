'use client';
import { createContext, useContext, useEffect, useState } from 'react';

export type Lang = 'en' | 'fr' | 'nl' | 'es';

export const translations = {
  en: {
    nav: {
      docs: 'Docs',
      signIn: 'Sign in',
      getStarted: 'Get started free',
    },
    hero: {
      badge: 'Powered by NVIDIA gpt-oss-120b',
      h1a: 'Generate lead magnets',
      h1b: 'in seconds with AI',
      sub: 'Create eBooks, checklists, guides, and templates. Publish a landing page. Capture leads. Everything in one place — no designers, no copywriters needed.',
      cta1: 'Start for free',
      cta2: 'Sign in',
      noCard: 'No credit card required',
    },
    preview: {
      magnets: 'Lead magnets',
      leads: 'Total leads',
      cvr: 'Conversion rate',
      recent: 'Recent lead magnets',
      statuses: { Active: 'Active', Draft: 'Draft' } as Record<string, string>,
    },
    features: {
      heading: 'Everything you need to capture leads',
      sub: 'From AI content generation to published landing pages — the full funnel in one tool.',
      items: [
        { title: 'AI content generation', desc: 'Describe your audience and tone. Get a fully written eBook, checklist, or guide in under 20 seconds.' },
        { title: 'Instant landing pages', desc: 'Publish a conversion-optimised landing page with a custom slug in one click. No design skills needed.' },
        { title: 'Lead capture & CRM', desc: 'Every form submission is stored, tagged with UTM source, and available for export or webhook delivery.' },
        { title: 'Auto PDF delivery', desc: 'Generated content is rendered into a styled PDF and automatically emailed to every new lead.' },
        { title: 'Analytics & UTM tracking', desc: 'See page views, lead counts, conversion rates, and which traffic sources perform best — per landing page.' },
        { title: 'Webhooks & integrations', desc: 'Push new leads to your CRM, email platform, or Zapier in real-time via configurable webhooks.' },
      ],
    },
    howItWorks: {
      heading: 'How it works',
      sub: 'Three steps from idea to live lead capture.',
      steps: [
        { title: 'Describe your lead magnet', desc: 'Pick a type (checklist, guide, eBook), enter a title and target audience. The AI writes the full content.' },
        { title: 'Publish a landing page', desc: 'One click creates a public landing page at your custom slug with a lead capture form already attached.' },
        { title: 'Watch leads come in', desc: 'Every submission is logged, the PDF is emailed to the lead, and you get notified instantly.' },
      ],
    },
    cta: {
      heading: 'Ready to grow your list?',
      sub: 'Create your first AI-generated lead magnet in under two minutes. Free to start.',
      button: 'Get started for free',
    },
    footer: {
      built: 'Built with Next.js + NVIDIA AI',
      home: 'Home',
      docs: 'Docs',
      signIn: 'Sign in',
      signUp: 'Sign up',
    },
    docs: {
      nav: 'On this page',
      tag: 'Documentation',
      heading: 'How to use LeadMagnet AI',
      sub: 'Everything you need to go from idea to live lead capture — in under five minutes.',
      sections: [
        { id: 'getting-started', label: 'Getting started' },
        { id: 'create-lead-magnet', label: 'Create a lead magnet' },
        { id: 'ai-generation', label: 'AI content generation' },
        { id: 'landing-pages', label: 'Landing pages' },
        { id: 'leads', label: 'Leads & capture' },
        { id: 'pdf-delivery', label: 'PDF delivery' },
        { id: 'analytics', label: 'Analytics & UTM' },
        { id: 'webhooks', label: 'Webhooks' },
        { id: 'ab-testing', label: 'A/B testing' },
      ],
      gettingStarted: {
        heading: 'Getting started',
        body: 'LeadMagnet AI lets you create AI-written lead magnets (eBooks, checklists, guides, templates), publish a landing page with a lead capture form, and receive every submission automatically.',
        steps: [
          'Sign up at /signup — no credit card required.',
          'Create your first lead magnet using the AI generator.',
          'Publish a landing page linked to that lead magnet.',
          'Share the landing page URL and watch leads arrive.',
        ],
      },
      createMagnet: {
        heading: 'Create a lead magnet',
        body: 'Go to Lead Magnets → New in the dashboard.',
        fields: [
          { name: 'Title', desc: 'The name of your lead magnet. This becomes the headline inside the PDF and on the landing page. Be specific — e.g. "10 Cold Email Templates for SaaS Founders".' },
          { name: 'Type', desc: 'Choose the format that best fits your content:', types: [
            { name: 'eBook', desc: 'multi-chapter long-form content with intro and conclusion' },
            { name: 'Checklist', desc: '10–15 actionable items grouped by section' },
            { name: 'Guide', desc: 'step-by-step how-to with numbered instructions' },
            { name: 'Template', desc: 'fill-in-the-blank document with placeholder sections' },
            { name: 'Webinar sign-up', desc: 'agenda, outcomes, and speaker bio placeholder' },
          ]},
          { name: 'Content', desc: 'Write your own content, paste existing copy, or use the AI panel on the right to generate it automatically. HTML is supported.' },
        ],
      },
      aiGeneration: {
        heading: 'AI content generation',
        body: 'The AI panel on the new lead magnet page generates complete, structured content in one click. It uses NVIDIA gpt-oss-120b — typically returns content in 15–25 seconds.',
        fields: [
          { name: 'Target audience', desc: 'Who this lead magnet is for. Be specific: "B2B SaaS founders raising a seed round" produces better output than "startups".' },
          { name: 'Tone', desc: 'Professional, Casual, Authoritative, or Friendly. Defaults to Professional.' },
        ],
        tip: { heading: 'Tip', body: 'After generating, you can freely edit the content in the text area before saving. The AI output is a starting point, not locked in.' },
      },
      landingPages: {
        heading: 'Landing pages',
        body: 'Go to Landing Pages → New. Each landing page is linked to one lead magnet.',
        fields: [
          { name: 'Slug', desc: 'The URL path for your page: yourdomain.com/p/your-slug. Use lowercase letters and hyphens only. Must be unique.' },
          { name: 'CTA text', desc: 'The label on the download button. Defaults to "Get free access". Try action-oriented copy like "Download the checklist".' },
          { name: 'Published', desc: 'Unpublished pages return 404 to visitors. Toggle to publish when you\'re ready to share the link.' },
          { name: 'AI copy', desc: 'When you select a lead magnet, the headline, subheadline, and CTA text are generated automatically by AI. Edit them before saving.' },
          { name: 'Regenerate copy', desc: 'On the edit page, the Regenerate copy button rewrites all three copy fields from scratch using the lead magnet title.' },
        ],
        urlLabel: 'Public URL format',
      },
      leadsSection: {
        heading: 'Leads & capture',
        body1: 'Every visitor who submits the form on a landing page becomes a lead. The form collects email, optional full name, and GDPR consent.',
        body2: 'View all captured leads under Leads in the sidebar. You can filter by landing page.',
        recorded: 'What is recorded per lead',
        items: [
          'Email address and full name',
          'Which landing page they submitted on',
          'UTM parameters (source, medium, campaign) from the URL',
          'GDPR consent checkbox status',
          'Submission timestamp',
        ],
      },
      pdfDelivery: {
        heading: 'PDF delivery',
        body1: 'When a lead submits the form, the backend automatically generates a styled PDF from the lead magnet content and emails it to the lead\'s address.',
        body2: 'You can also manually generate and download a PDF for any lead magnet from the lead magnet detail page using the Download PDF button.',
        noteHeading: 'Email delivery requires Resend',
        noteBody: 'PDF emails are sent via Resend. The RESEND_API_KEY environment variable must be set on the backend. Free tier covers 3,000 emails/month.',
      },
      analytics: {
        heading: 'Analytics & UTM tracking',
        body: 'The Analytics page shows per-landing-page stats and aggregate totals.',
        metricsHeading: 'Metrics tracked',
        metrics: [
          { name: 'Page views', desc: 'every visit to /p/slug increments the counter' },
          { name: 'Leads', desc: 'number of successful form submissions' },
          { name: 'Conversion rate', desc: 'leads ÷ views × 100' },
          { name: 'Top source', desc: 'the UTM source that drove the most leads' },
        ],
        utmHeading: 'UTM parameters',
        utmBody: 'Add UTM params to your landing page URLs to track traffic sources:',
      },
      webhooks: {
        heading: 'Webhooks',
        body: 'Webhooks let you push new lead data to external systems (CRMs, email platforms, Zapier, Make) in real time. Configure them under Webhooks in the sidebar.',
        setupHeading: 'Setup',
        setupSteps: [
          'Click New webhook and enter your endpoint URL.',
          'Select which events to subscribe to (e.g. lead.created).',
          'Save — the webhook fires on the next matching event.',
        ],
        payloadHeading: 'Payload (lead.created)',
        securityHeading: 'Security',
        securityBody: 'Each webhook has a secret. The backend signs every request with an X-Webhook-Secret header — verify it on your endpoint to reject spoofed requests.',
      },
      abTesting: {
        heading: 'A/B testing',
        body: 'Test two variants of your landing page copy to find which converts better. No extra configuration needed — all data is stored per page.',
        enableHeading: 'How to set up a test',
        enableSteps: [
          'Open a landing page and locate the A/B Test card.',
          'Toggle the switch to On.',
          'Enter alternative headline, subheadline, and CTA text for Variant B — or click AI generate to auto-fill.',
          'Set the traffic split (default 50/50) and click Save test.',
          'Publish the page — visitors are randomly assigned to Variant A or B and stay in that variant for the session.',
        ],
        resultsHeading: 'Reading results',
        resultsBody: 'The Results card shows views, leads, and conversion rate for each variant. Click Refresh to update the data.',
        winnerHeading: 'Winner detection',
        winnerBody: 'A winner is declared automatically when both variants reach 50 views and one has a 20% higher conversion rate, or both reach 30 leads and one has a 15% higher conversion rate.',
        resetNote: 'Use Reset stats to start a fresh experiment without changing the copy.',
      },
      docsCta: {
        heading: 'Ready to start?',
        sub: 'Create your first lead magnet in under two minutes.',
        button: 'Get started free',
      },
    },
  },

  fr: {
    nav: {
      docs: 'Documentation',
      signIn: 'Se connecter',
      getStarted: 'Commencer gratuitement',
    },
    hero: {
      badge: 'Propulsé par NVIDIA gpt-oss-120b',
      h1a: 'Générez des lead magnets',
      h1b: 'en quelques secondes grâce à l\'IA',
      sub: 'Créez des eBooks, checklists, guides et modèles. Publiez une page de capture. Collectez des prospects. Tout en un — sans designer ni rédacteur.',
      cta1: 'Commencer gratuitement',
      cta2: 'Se connecter',
      noCard: 'Aucune carte bancaire requise',
    },
    preview: {
      magnets: 'Lead magnets',
      leads: 'Prospects totaux',
      cvr: 'Taux de conversion',
      recent: 'Lead magnets récents',
      statuses: { Active: 'Actif', Draft: 'Brouillon' } as Record<string, string>,
    },
    features: {
      heading: 'Tout ce qu\'il faut pour capturer des prospects',
      sub: 'De la génération de contenu IA aux pages de destination publiées — l\'entonnoir complet en un seul outil.',
      items: [
        { title: 'Génération de contenu IA', desc: 'Décrivez votre audience et le ton souhaité. Obtenez un eBook, une checklist ou un guide complet en moins de 20 secondes.' },
        { title: 'Pages de destination instantanées', desc: 'Publiez une page optimisée pour la conversion avec un slug personnalisé en un clic. Aucune compétence en design requise.' },
        { title: 'Capture de leads & CRM', desc: 'Chaque soumission est enregistrée, taguée avec la source UTM et disponible pour l\'export ou la livraison par webhook.' },
        { title: 'Livraison PDF automatique', desc: 'Le contenu généré est converti en PDF stylisé et envoyé automatiquement par email à chaque nouveau prospect.' },
        { title: 'Analytique & suivi UTM', desc: 'Consultez les vues, le nombre de leads, les taux de conversion et les meilleures sources de trafic — par page de destination.' },
        { title: 'Webhooks & intégrations', desc: 'Envoyez les nouveaux leads vers votre CRM, votre plateforme email ou Zapier en temps réel via des webhooks configurables.' },
      ],
    },
    howItWorks: {
      heading: 'Comment ça fonctionne',
      sub: 'Trois étapes de l\'idée à la capture de leads en direct.',
      steps: [
        { title: 'Décrivez votre lead magnet', desc: 'Choisissez un type (checklist, guide, eBook), entrez un titre et une audience cible. L\'IA rédige tout le contenu.' },
        { title: 'Publiez une page de destination', desc: 'Un clic crée une page publique sur votre slug personnalisé avec un formulaire de capture déjà intégré.' },
        { title: 'Regardez les leads arriver', desc: 'Chaque soumission est enregistrée, le PDF est envoyé au prospect et vous êtes notifié instantanément.' },
      ],
    },
    cta: {
      heading: 'Prêt à développer votre liste ?',
      sub: 'Créez votre premier lead magnet généré par IA en moins de deux minutes. Gratuit pour commencer.',
      button: 'Commencer gratuitement',
    },
    footer: {
      built: 'Créé avec Next.js + NVIDIA AI',
      home: 'Accueil',
      docs: 'Documentation',
      signIn: 'Se connecter',
      signUp: 'S\'inscrire',
    },
    docs: {
      nav: 'Sur cette page',
      tag: 'Documentation',
      heading: 'Comment utiliser LeadMagnet AI',
      sub: 'Tout ce dont vous avez besoin pour passer de l\'idée à la capture de leads — en moins de cinq minutes.',
      sections: [
        { id: 'getting-started', label: 'Démarrage' },
        { id: 'create-lead-magnet', label: 'Créer un lead magnet' },
        { id: 'ai-generation', label: 'Génération de contenu IA' },
        { id: 'landing-pages', label: 'Pages de destination' },
        { id: 'leads', label: 'Leads & capture' },
        { id: 'pdf-delivery', label: 'Livraison PDF' },
        { id: 'analytics', label: 'Analytique & UTM' },
        { id: 'webhooks', label: 'Webhooks' },
        { id: 'ab-testing', label: 'Tests A/B' },
      ],
      gettingStarted: {
        heading: 'Démarrage',
        body: 'LeadMagnet AI vous permet de créer des lead magnets rédigés par l\'IA (eBooks, checklists, guides, modèles), de publier une page de capture et de recevoir chaque soumission automatiquement.',
        steps: [
          'Inscrivez-vous sur /signup — aucune carte bancaire requise.',
          'Créez votre premier lead magnet avec le générateur IA.',
          'Publiez une page de destination liée à ce lead magnet.',
          'Partagez l\'URL et regardez les prospects arriver.',
        ],
      },
      createMagnet: {
        heading: 'Créer un lead magnet',
        body: 'Allez dans Lead Magnets → Nouveau dans le tableau de bord.',
        fields: [
          { name: 'Titre', desc: 'Le nom de votre lead magnet. Il devient le titre dans le PDF et sur la page de destination. Soyez précis — ex. "10 modèles d\'emails froids pour les fondateurs SaaS".' },
          { name: 'Type', desc: 'Choisissez le format qui correspond le mieux à votre contenu :', types: [
            { name: 'eBook', desc: 'contenu long format multi-chapitres avec intro et conclusion' },
            { name: 'Checklist', desc: '10 à 15 éléments actionnables regroupés par section' },
            { name: 'Guide', desc: 'tutoriel étape par étape avec instructions numérotées' },
            { name: 'Modèle', desc: 'document à compléter avec sections et instructions' },
            { name: 'Inscription webinaire', desc: 'programme, résultats et bio de l\'intervenant' },
          ]},
          { name: 'Contenu', desc: 'Rédigez votre propre contenu, collez un texte existant ou utilisez le panneau IA à droite pour le générer automatiquement. Le HTML est supporté.' },
        ],
      },
      aiGeneration: {
        heading: 'Génération de contenu IA',
        body: 'Le panneau IA sur la page de création génère un contenu complet et structuré en un clic. Il utilise NVIDIA gpt-oss-120b — le contenu est retourné en 15 à 25 secondes.',
        fields: [
          { name: 'Audience cible', desc: 'Pour qui est ce lead magnet. Soyez précis : "Fondateurs SaaS B2B en amorçage" donne de meilleurs résultats que "startups".' },
          { name: 'Ton', desc: 'Professionnel, Décontracté, Autoritaire ou Amical. Par défaut : Professionnel.' },
        ],
        tip: { heading: 'Conseil', body: 'Après la génération, vous pouvez modifier librement le contenu dans la zone de texte avant d\'enregistrer. Le résultat de l\'IA est un point de départ, pas figé.' },
      },
      landingPages: {
        heading: 'Pages de destination',
        body: 'Allez dans Pages de destination → Nouvelle. Chaque page est liée à un lead magnet.',
        fields: [
          { name: 'Slug', desc: 'Le chemin URL de votre page : votredomaine.com/p/votre-slug. Utilisez uniquement des minuscules et des tirets. Doit être unique.' },
          { name: 'Texte du CTA', desc: 'Le libellé du bouton de téléchargement. Par défaut "Accès gratuit". Essayez un texte orienté action comme "Télécharger la checklist".' },
          { name: 'Publié', desc: 'Les pages non publiées retournent une 404 aux visiteurs. Activez quand vous êtes prêt à partager le lien.' },
          { name: 'Texte IA', desc: 'Quand vous sélectionnez un lead magnet, le titre, le sous-titre et le texte CTA sont générés automatiquement par l\'IA. Modifiez-les avant d\'enregistrer.' },
          { name: 'Regénérer le texte', desc: 'Sur la page d\'édition, le bouton Regénérer le texte réécrit les trois champs à partir du titre du lead magnet.' },
        ],
        urlLabel: 'Format de l\'URL publique',
      },
      leadsSection: {
        heading: 'Leads & capture',
        body1: 'Chaque visiteur qui soumet le formulaire sur une page de destination devient un prospect. Le formulaire collecte l\'email, le nom complet optionnel et le consentement RGPD.',
        body2: 'Consultez tous les leads capturés sous Leads dans la barre latérale. Vous pouvez filtrer par page de destination.',
        recorded: 'Ce qui est enregistré par prospect',
        items: [
          'Adresse email et nom complet',
          'Quelle page de destination a été soumise',
          'Paramètres UTM (source, medium, campagne) de l\'URL',
          'Statut de la case à cocher de consentement RGPD',
          'Horodatage de la soumission',
        ],
      },
      pdfDelivery: {
        heading: 'Livraison PDF',
        body1: 'Quand un prospect soumet le formulaire, le backend génère automatiquement un PDF stylisé à partir du contenu et l\'envoie par email à l\'adresse du prospect.',
        body2: 'Vous pouvez aussi générer et télécharger manuellement un PDF depuis la page de détail du lead magnet via le bouton Télécharger PDF.',
        noteHeading: 'La livraison email nécessite Resend',
        noteBody: 'Les emails PDF sont envoyés via Resend. La variable d\'environnement RESEND_API_KEY doit être définie sur le backend. Le plan gratuit couvre 3 000 emails/mois.',
      },
      analytics: {
        heading: 'Analytique & suivi UTM',
        body: 'La page Analytique affiche les statistiques par page de destination et les totaux agrégés.',
        metricsHeading: 'Métriques suivies',
        metrics: [
          { name: 'Vues de page', desc: 'chaque visite sur /p/slug incrémente le compteur' },
          { name: 'Leads', desc: 'nombre de soumissions de formulaire réussies' },
          { name: 'Taux de conversion', desc: 'leads ÷ vues × 100' },
          { name: 'Meilleure source', desc: 'la source UTM qui a généré le plus de leads' },
        ],
        utmHeading: 'Paramètres UTM',
        utmBody: 'Ajoutez des paramètres UTM à vos URLs de page de destination pour suivre les sources de trafic :',
      },
      webhooks: {
        heading: 'Webhooks',
        body: 'Les webhooks vous permettent d\'envoyer les données des nouveaux leads vers des systèmes externes (CRM, plateformes email, Zapier, Make) en temps réel. Configurez-les sous Webhooks dans la barre latérale.',
        setupHeading: 'Configuration',
        setupSteps: [
          'Cliquez sur Nouveau webhook et entrez l\'URL de votre endpoint.',
          'Sélectionnez les événements auxquels vous souhaitez vous abonner (ex. lead.created).',
          'Enregistrez — le webhook se déclenche au prochain événement correspondant.',
        ],
        payloadHeading: 'Payload (lead.created)',
        securityHeading: 'Sécurité',
        securityBody: 'Chaque webhook a un secret. Le backend signe chaque requête avec un en-tête X-Webhook-Secret — vérifiez-le sur votre endpoint pour rejeter les requêtes frauduleuses.',
      },
      abTesting: {
        heading: 'Tests A/B',
        body: 'Testez deux variantes du texte de votre page de destination pour trouver celle qui convertit le mieux. Aucune configuration supplémentaire — toutes les données sont stockées par page.',
        enableHeading: 'Comment configurer un test',
        enableSteps: [
          'Ouvrez une page de destination et localisez la carte Test A/B.',
          'Activez l\'interrupteur.',
          'Entrez un titre, sous-titre et texte CTA alternatifs pour la Variante B — ou cliquez sur Générer avec l\'IA.',
          'Définissez la répartition du trafic (50/50 par défaut) et cliquez sur Enregistrer le test.',
          'Publiez la page — les visiteurs sont assignés aléatoirement à la Variante A ou B pour leur session.',
        ],
        resultsHeading: 'Lire les résultats',
        resultsBody: 'La carte Résultats affiche les vues, leads et taux de conversion pour chaque variante. Cliquez sur Actualiser pour mettre à jour.',
        winnerHeading: 'Détection du gagnant',
        winnerBody: 'Un gagnant est automatiquement désigné quand les deux variantes atteignent 50 vues et l\'une a un taux 20 % supérieur, ou 30 leads et l\'une a un taux 15 % supérieur.',
        resetNote: 'Utilisez Réinitialiser les stats pour recommencer un test sans changer le texte.',
      },
      docsCta: {
        heading: 'Prêt à commencer ?',
        sub: 'Créez votre premier lead magnet en moins de deux minutes.',
        button: 'Commencer gratuitement',
      },
    },
  },

  nl: {
    nav: {
      docs: 'Documentatie',
      signIn: 'Aanmelden',
      getStarted: 'Gratis beginnen',
    },
    hero: {
      badge: 'Aangedreven door NVIDIA gpt-oss-120b',
      h1a: 'Genereer lead magnets',
      h1b: 'in seconden met AI',
      sub: 'Maak eBooks, checklists, gidsen en sjablonen. Publiceer een landingspagina. Verzamel leads. Alles op één plek — geen ontwerpers of copywriters nodig.',
      cta1: 'Gratis beginnen',
      cta2: 'Aanmelden',
      noCard: 'Geen creditcard vereist',
    },
    preview: {
      magnets: 'Lead magnets',
      leads: 'Totale leads',
      cvr: 'Conversieratio',
      recent: 'Recente lead magnets',
      statuses: { Active: 'Actief', Draft: 'Concept' } as Record<string, string>,
    },
    features: {
      heading: 'Alles wat u nodig heeft om leads te verzamelen',
      sub: 'Van AI-contentgeneratie tot gepubliceerde landingspagina\'s — de volledige funnel in één tool.',
      items: [
        { title: 'AI-contentgeneratie', desc: 'Beschrijf uw doelgroep en toon. Ontvang een volledig geschreven eBook, checklist of gids in minder dan 20 seconden.' },
        { title: 'Directe landingspagina\'s', desc: 'Publiceer een op conversie geoptimaliseerde landingspagina met een aangepaste slug met één klik. Geen ontwerpkennis nodig.' },
        { title: 'Leadcaptuur & CRM', desc: 'Elke formulierinzending wordt opgeslagen, getagd met UTM-bron en is beschikbaar voor export of webhooklevering.' },
        { title: 'Automatische PDF-levering', desc: 'Gegenereerde content wordt omgezet in een gestylde PDF en automatisch per e-mail naar elke nieuwe lead verzonden.' },
        { title: 'Analytics & UTM-tracking', desc: 'Bekijk paginaweergaven, leadaantallen, conversieratio\'s en beste verkeersbronnen — per landingspagina.' },
        { title: 'Webhooks & integraties', desc: 'Stuur nieuwe leads in realtime naar uw CRM, e-mailplatform of Zapier via configureerbare webhooks.' },
      ],
    },
    howItWorks: {
      heading: 'Hoe het werkt',
      sub: 'Drie stappen van idee tot live leadcaptuur.',
      steps: [
        { title: 'Beschrijf uw lead magnet', desc: 'Kies een type (checklist, gids, eBook), voer een titel en doelgroep in. De AI schrijft de volledige inhoud.' },
        { title: 'Publiceer een landingspagina', desc: 'Eén klik maakt een openbare pagina op uw aangepaste slug met een leadcaptuurformulier al bijgevoegd.' },
        { title: 'Bekijk hoe leads binnenkomen', desc: 'Elke inzending wordt gelogd, de PDF wordt naar de lead gemaild en u wordt direct op de hoogte gesteld.' },
      ],
    },
    cta: {
      heading: 'Klaar om uw lijst te laten groeien?',
      sub: 'Maak uw eerste AI-gegenereerde lead magnet in minder dan twee minuten. Gratis te beginnen.',
      button: 'Gratis beginnen',
    },
    footer: {
      built: 'Gebouwd met Next.js + NVIDIA AI',
      home: 'Home',
      docs: 'Documentatie',
      signIn: 'Aanmelden',
      signUp: 'Registreren',
    },
    docs: {
      nav: 'Op deze pagina',
      tag: 'Documentatie',
      heading: 'Hoe LeadMagnet AI te gebruiken',
      sub: 'Alles wat u nodig heeft om van idee naar live leadcaptuur te gaan — in minder dan vijf minuten.',
      sections: [
        { id: 'getting-started', label: 'Aan de slag' },
        { id: 'create-lead-magnet', label: 'Lead magnet aanmaken' },
        { id: 'ai-generation', label: 'AI-contentgeneratie' },
        { id: 'landing-pages', label: 'Landingspagina\'s' },
        { id: 'leads', label: 'Leads & captuur' },
        { id: 'pdf-delivery', label: 'PDF-levering' },
        { id: 'analytics', label: 'Analytics & UTM' },
        { id: 'webhooks', label: 'Webhooks' },
        { id: 'ab-testing', label: 'A/B-testen' },
      ],
      gettingStarted: {
        heading: 'Aan de slag',
        body: 'LeadMagnet AI laat u door AI geschreven lead magnets (eBooks, checklists, gidsen, sjablonen) aanmaken, een landingspagina publiceren en elke inzending automatisch ontvangen.',
        steps: [
          'Registreer op /signup — geen creditcard vereist.',
          'Maak uw eerste lead magnet met de AI-generator.',
          'Publiceer een landingspagina gekoppeld aan die lead magnet.',
          'Deel de URL en bekijk hoe leads binnenkomen.',
        ],
      },
      createMagnet: {
        heading: 'Lead magnet aanmaken',
        body: 'Ga naar Lead Magnets → Nieuw in het dashboard.',
        fields: [
          { name: 'Titel', desc: 'De naam van uw lead magnet. Dit wordt de kop in de PDF en op de landingspagina. Wees specifiek — bijv. "10 Koude E-mailsjablonen voor SaaS-oprichters".' },
          { name: 'Type', desc: 'Kies het formaat dat het beste bij uw inhoud past:', types: [
            { name: 'eBook', desc: 'uitgebreide meerdere-hoofstukken inhoud met intro en conclusie' },
            { name: 'Checklist', desc: '10–15 uitvoerbare items gegroepeerd per sectie' },
            { name: 'Gids', desc: 'stap-voor-stap handleiding met genummerde instructies' },
            { name: 'Sjabloon', desc: 'invuldocument met tijdelijke secties en instructies' },
            { name: 'Webinar-aanmelding', desc: 'agenda, uitkomsten en plaatshouder voor sprekersbiografie' },
          ]},
          { name: 'Inhoud', desc: 'Schrijf uw eigen inhoud, plak bestaande tekst of gebruik het AI-paneel rechts om het automatisch te genereren. HTML wordt ondersteund.' },
        ],
      },
      aiGeneration: {
        heading: 'AI-contentgeneratie',
        body: 'Het AI-paneel op de nieuwe lead magnet-pagina genereert volledige, gestructureerde inhoud met één klik. Het gebruikt NVIDIA gpt-oss-120b — retourneert content in 15–25 seconden.',
        fields: [
          { name: 'Doelgroep', desc: 'Voor wie is deze lead magnet. Wees specifiek: "B2B SaaS-oprichters die een seed-ronde ophalen" levert betere output dan "startups".' },
          { name: 'Toon', desc: 'Professioneel, Informeel, Gezaghebbend of Vriendelijk. Standaard: Professioneel.' },
        ],
        tip: { heading: 'Tip', body: 'Na het genereren kunt u de inhoud vrij bewerken in het tekstvak voordat u opslaat. De AI-output is een startpunt, niet definitief.' },
      },
      landingPages: {
        heading: 'Landingspagina\'s',
        body: 'Ga naar Landingspagina\'s → Nieuw. Elke landingspagina is gekoppeld aan één lead magnet.',
        fields: [
          { name: 'Slug', desc: 'Het URL-pad van uw pagina: uwdomein.com/p/uw-slug. Gebruik alleen kleine letters en koppeltekens. Moet uniek zijn.' },
          { name: 'CTA-tekst', desc: 'Het label op de downloadknop. Standaard "Gratis toegang". Probeer actiegerichte tekst zoals "Download de checklist".' },
          { name: 'Gepubliceerd', desc: 'Niet-gepubliceerde pagina\'s geven 404 terug aan bezoekers. Schakel in wanneer u klaar bent om de link te delen.' },
          { name: 'AI-tekst', desc: 'Wanneer u een lead magnet selecteert, worden de koptekst, subkop en CTA-tekst automatisch gegenereerd door AI. Bewerk ze voor het opslaan.' },
          { name: 'Tekst regenereren', desc: 'Op de bewerkpagina herschrijft de knop Tekst regenereren alle drie de tekstvelden op basis van de lead magnet-titel.' },
        ],
        urlLabel: 'Openbaar URL-formaat',
      },
      leadsSection: {
        heading: 'Leads & captuur',
        body1: 'Elke bezoeker die het formulier op een landingspagina indient wordt een lead. Het formulier verzamelt e-mail, optionele volledige naam en AVG-toestemming.',
        body2: 'Bekijk alle vastgelegde leads onder Leads in de zijbalk. U kunt filteren op landingspagina.',
        recorded: 'Wat er per lead wordt vastgelegd',
        items: [
          'E-mailadres en volledige naam',
          'Welke landingspagina is ingediend',
          'UTM-parameters (bron, medium, campagne) uit de URL',
          'Status van het AVG-toestemmingsvakje',
          'Tijdstempel van de inzending',
        ],
      },
      pdfDelivery: {
        heading: 'PDF-levering',
        body1: 'Wanneer een lead het formulier indient, genereert de backend automatisch een gestylde PDF van de lead magnet-inhoud en mailt deze naar het e-mailadres van de lead.',
        body2: 'U kunt ook handmatig een PDF genereren en downloaden via de knop PDF Downloaden op de detailpagina van de lead magnet.',
        noteHeading: 'E-maillevering vereist Resend',
        noteBody: 'PDF-e-mails worden verstuurd via Resend. De omgevingsvariabele RESEND_API_KEY moet ingesteld zijn op de backend. Het gratis plan omvat 3.000 e-mails/maand.',
      },
      analytics: {
        heading: 'Analytics & UTM-tracking',
        body: 'De Analytics-pagina toont statistieken per landingspagina en geaggregeerde totalen.',
        metricsHeading: 'Bijgehouden statistieken',
        metrics: [
          { name: 'Paginaweergaven', desc: 'elk bezoek aan /p/slug verhoogt de teller' },
          { name: 'Leads', desc: 'aantal succesvolle formulierinzendingen' },
          { name: 'Conversieratio', desc: 'leads ÷ weergaven × 100' },
          { name: 'Beste bron', desc: 'de UTM-bron die de meeste leads heeft gegenereerd' },
        ],
        utmHeading: 'UTM-parameters',
        utmBody: 'Voeg UTM-parameters toe aan uw landingspagina-URL\'s om verkeersbronnen bij te houden:',
      },
      webhooks: {
        heading: 'Webhooks',
        body: 'Webhooks laten u nieuwe leadgegevens in realtime naar externe systemen (CRM\'s, e-mailplatforms, Zapier, Make) sturen. Configureer ze onder Webhooks in de zijbalk.',
        setupHeading: 'Instellen',
        setupSteps: [
          'Klik op Nieuwe webhook en voer de URL van uw endpoint in.',
          'Selecteer op welke gebeurtenissen u zich wilt abonneren (bijv. lead.created).',
          'Opslaan — de webhook wordt geactiveerd bij de volgende overeenkomende gebeurtenis.',
        ],
        payloadHeading: 'Payload (lead.created)',
        securityHeading: 'Beveiliging',
        securityBody: 'Elke webhook heeft een geheim. De backend ondertekent elk verzoek met een X-Webhook-Secret-header — verifieer dit op uw endpoint om vervalste verzoeken te weigeren.',
      },
      abTesting: {
        heading: 'A/B-testen',
        body: 'Test twee varianten van uw landingspagina-tekst om te ontdekken welke beter converteert. Geen extra configuratie nodig — alle gegevens worden per pagina opgeslagen.',
        enableHeading: 'Een test instellen',
        enableSteps: [
          'Open een landingspagina en zoek de A/B-testkaart.',
          'Zet de schakelaar op Aan.',
          'Voer alternatieve koptekst, subkop en CTA-tekst in voor Variant B — of klik op AI genereren.',
          'Stel de trafiekverdeling in (standaard 50/50) en klik op Test opslaan.',
          'Publiceer de pagina — bezoekers worden willekeurig toegewezen aan Variant A of B voor hun sessie.',
        ],
        resultsHeading: 'Resultaten lezen',
        resultsBody: 'De Resultatenkaart toont weergaven, leads en conversieratio per variant. Klik op Vernieuwen om bij te werken.',
        winnerHeading: 'Winnaardetectie',
        winnerBody: 'Een winnaar wordt automatisch aangewezen wanneer beide varianten 50 weergaven bereiken en één een 20% hogere conversieratio heeft, of 30 leads en één een 15% hogere ratio.',
        resetNote: 'Gebruik Statistieken resetten om een nieuw experiment te starten zonder de tekst te wijzigen.',
      },
      docsCta: {
        heading: 'Klaar om te beginnen?',
        sub: 'Maak uw eerste lead magnet in minder dan twee minuten.',
        button: 'Gratis beginnen',
      },
    },
  },

  es: {
    nav: {
      docs: 'Documentación',
      signIn: 'Iniciar sesión',
      getStarted: 'Comenzar gratis',
    },
    hero: {
      badge: 'Impulsado por NVIDIA gpt-oss-120b',
      h1a: 'Genera lead magnets',
      h1b: 'en segundos con IA',
      sub: 'Crea eBooks, checklists, guías y plantillas. Publica una página de captura. Captura leads. Todo en un lugar — sin diseñadores ni redactores.',
      cta1: 'Comenzar gratis',
      cta2: 'Iniciar sesión',
      noCard: 'Sin tarjeta de crédito requerida',
    },
    preview: {
      magnets: 'Lead magnets',
      leads: 'Leads totales',
      cvr: 'Tasa de conversión',
      recent: 'Lead magnets recientes',
      statuses: { Active: 'Activo', Draft: 'Borrador' } as Record<string, string>,
    },
    features: {
      heading: 'Todo lo que necesitas para capturar leads',
      sub: 'Desde la generación de contenido con IA hasta páginas de destino publicadas — el embudo completo en una sola herramienta.',
      items: [
        { title: 'Generación de contenido con IA', desc: 'Describe tu audiencia y tono. Obtén un eBook, checklist o guía completamente escrito en menos de 20 segundos.' },
        { title: 'Páginas de destino instantáneas', desc: 'Publica una página optimizada para conversión con un slug personalizado en un clic. Sin habilidades de diseño.' },
        { title: 'Captura de leads & CRM', desc: 'Cada envío de formulario se almacena, etiqueta con la fuente UTM y está disponible para exportar o entregar por webhook.' },
        { title: 'Entrega automática de PDF', desc: 'El contenido generado se convierte en un PDF con estilo y se envía automáticamente por correo a cada nuevo lead.' },
        { title: 'Analíticas & seguimiento UTM', desc: 'Consulta vistas de página, recuento de leads, tasas de conversión y las mejores fuentes de tráfico — por página de destino.' },
        { title: 'Webhooks & integraciones', desc: 'Envía nuevos leads a tu CRM, plataforma de correo o Zapier en tiempo real mediante webhooks configurables.' },
      ],
    },
    howItWorks: {
      heading: 'Cómo funciona',
      sub: 'Tres pasos de la idea a la captura de leads en vivo.',
      steps: [
        { title: 'Describe tu lead magnet', desc: 'Elige un tipo (checklist, guía, eBook), ingresa un título y audiencia objetivo. La IA escribe todo el contenido.' },
        { title: 'Publica una página de destino', desc: 'Un clic crea una página pública en tu slug personalizado con un formulario de captura ya adjunto.' },
        { title: 'Observa cómo llegan los leads', desc: 'Cada envío se registra, el PDF se envía al lead y recibes una notificación al instante.' },
      ],
    },
    cta: {
      heading: '¿Listo para hacer crecer tu lista?',
      sub: 'Crea tu primer lead magnet generado por IA en menos de dos minutos. Gratis para empezar.',
      button: 'Comenzar gratis',
    },
    footer: {
      built: 'Creado con Next.js + NVIDIA AI',
      home: 'Inicio',
      docs: 'Documentación',
      signIn: 'Iniciar sesión',
      signUp: 'Registrarse',
    },
    docs: {
      nav: 'En esta página',
      tag: 'Documentación',
      heading: 'Cómo usar LeadMagnet AI',
      sub: 'Todo lo que necesitas para pasar de la idea a la captura de leads — en menos de cinco minutos.',
      sections: [
        { id: 'getting-started', label: 'Primeros pasos' },
        { id: 'create-lead-magnet', label: 'Crear un lead magnet' },
        { id: 'ai-generation', label: 'Generación de contenido con IA' },
        { id: 'landing-pages', label: 'Páginas de destino' },
        { id: 'leads', label: 'Leads & captura' },
        { id: 'pdf-delivery', label: 'Entrega de PDF' },
        { id: 'analytics', label: 'Analíticas & UTM' },
        { id: 'webhooks', label: 'Webhooks' },
        { id: 'ab-testing', label: 'Pruebas A/B' },
      ],
      gettingStarted: {
        heading: 'Primeros pasos',
        body: 'LeadMagnet AI te permite crear lead magnets escritos por IA (eBooks, checklists, guías, plantillas), publicar una página de captura y recibir cada envío automáticamente.',
        steps: [
          'Regístrate en /signup — sin tarjeta de crédito.',
          'Crea tu primer lead magnet con el generador de IA.',
          'Publica una página de destino vinculada a ese lead magnet.',
          'Comparte la URL y observa cómo llegan los leads.',
        ],
      },
      createMagnet: {
        heading: 'Crear un lead magnet',
        body: 'Ve a Lead Magnets → Nuevo en el panel de control.',
        fields: [
          { name: 'Título', desc: 'El nombre de tu lead magnet. Se convierte en el titular del PDF y la página de destino. Sé específico — ej. "10 Plantillas de Correo Frío para Fundadores SaaS".' },
          { name: 'Tipo', desc: 'Elige el formato que mejor se adapte a tu contenido:', types: [
            { name: 'eBook', desc: 'contenido largo con múltiples capítulos, intro y conclusión' },
            { name: 'Checklist', desc: '10–15 elementos accionables agrupados por sección' },
            { name: 'Guía', desc: 'tutorial paso a paso con instrucciones numeradas' },
            { name: 'Plantilla', desc: 'documento con espacios para completar y secciones de marcador de posición' },
            { name: 'Registro de webinar', desc: 'agenda, resultados y marcador de posición para la bio del ponente' },
          ]},
          { name: 'Contenido', desc: 'Escribe tu propio contenido, pega texto existente o usa el panel de IA a la derecha para generarlo automáticamente. Se admite HTML.' },
        ],
      },
      aiGeneration: {
        heading: 'Generación de contenido con IA',
        body: 'El panel de IA en la página de nuevo lead magnet genera contenido completo y estructurado en un clic. Usa NVIDIA gpt-oss-120b — normalmente devuelve el contenido en 15–25 segundos.',
        fields: [
          { name: 'Audiencia objetivo', desc: 'Para quién es este lead magnet. Sé específico: "Fundadores de SaaS B2B en ronda seed" produce mejores resultados que "startups".' },
          { name: 'Tono', desc: 'Profesional, Casual, Autoritativo o Amigable. Por defecto: Profesional.' },
        ],
        tip: { heading: 'Consejo', body: 'Después de generar, puedes editar libremente el contenido en el área de texto antes de guardar. El resultado de la IA es un punto de partida, no es definitivo.' },
      },
      landingPages: {
        heading: 'Páginas de destino',
        body: 'Ve a Páginas de destino → Nueva. Cada página de destino está vinculada a un lead magnet.',
        fields: [
          { name: 'Slug', desc: 'La ruta URL de tu página: tudominio.com/p/tu-slug. Usa solo letras minúsculas y guiones. Debe ser único.' },
          { name: 'Texto del CTA', desc: 'La etiqueta del botón de descarga. Por defecto "Acceso gratuito". Prueba texto orientado a la acción como "Descargar el checklist".' },
          { name: 'Publicado', desc: 'Las páginas no publicadas devuelven 404 a los visitantes. Activa cuando estés listo para compartir el enlace.' },
          { name: 'Texto con IA', desc: 'Cuando seleccionas un lead magnet, el titular, subtítulo y texto del CTA se generan automáticamente con IA. Edítalos antes de guardar.' },
          { name: 'Regenerar texto', desc: 'En la página de edición, el botón Regenerar texto reescribe los tres campos de copia desde cero usando el título del lead magnet.' },
        ],
        urlLabel: 'Formato de URL pública',
      },
      leadsSection: {
        heading: 'Leads & captura',
        body1: 'Cada visitante que envía el formulario en una página de destino se convierte en un lead. El formulario recopila correo electrónico, nombre completo opcional y consentimiento RGPD.',
        body2: 'Consulta todos los leads capturados en Leads en la barra lateral. Puedes filtrar por página de destino.',
        recorded: 'Qué se registra por lead',
        items: [
          'Correo electrónico y nombre completo',
          'Qué página de destino enviaron',
          'Parámetros UTM (fuente, medio, campaña) de la URL',
          'Estado de la casilla de consentimiento RGPD',
          'Marca de tiempo del envío',
        ],
      },
      pdfDelivery: {
        heading: 'Entrega de PDF',
        body1: 'Cuando un lead envía el formulario, el backend genera automáticamente un PDF con estilo a partir del contenido del lead magnet y lo envía por correo a la dirección del lead.',
        body2: 'También puedes generar y descargar manualmente un PDF desde la página de detalle del lead magnet usando el botón Descargar PDF.',
        noteHeading: 'La entrega por correo requiere Resend',
        noteBody: 'Los correos PDF se envían a través de Resend. La variable de entorno RESEND_API_KEY debe estar configurada en el backend. El plan gratuito cubre 3.000 correos/mes.',
      },
      analytics: {
        heading: 'Analíticas & seguimiento UTM',
        body: 'La página de Analíticas muestra estadísticas por página de destino y totales agregados.',
        metricsHeading: 'Métricas rastreadas',
        metrics: [
          { name: 'Vistas de página', desc: 'cada visita a /p/slug incrementa el contador' },
          { name: 'Leads', desc: 'número de envíos de formulario exitosos' },
          { name: 'Tasa de conversión', desc: 'leads ÷ vistas × 100' },
          { name: 'Mejor fuente', desc: 'la fuente UTM que generó más leads' },
        ],
        utmHeading: 'Parámetros UTM',
        utmBody: 'Añade parámetros UTM a las URLs de tu página de destino para rastrear fuentes de tráfico:',
      },
      webhooks: {
        heading: 'Webhooks',
        body: 'Los webhooks te permiten enviar datos de nuevos leads a sistemas externos (CRMs, plataformas de correo, Zapier, Make) en tiempo real. Confíguralos en Webhooks en la barra lateral.',
        setupHeading: 'Configuración',
        setupSteps: [
          'Haz clic en Nuevo webhook e ingresa la URL de tu endpoint.',
          'Selecciona los eventos a los que deseas suscribirte (ej. lead.created).',
          'Guarda — el webhook se activa en el próximo evento correspondiente.',
        ],
        payloadHeading: 'Payload (lead.created)',
        securityHeading: 'Seguridad',
        securityBody: 'Cada webhook tiene un secreto. El backend firma cada solicitud con un encabezado X-Webhook-Secret — verifícalo en tu endpoint para rechazar solicitudes falsificadas.',
      },
      abTesting: {
        heading: 'Pruebas A/B',
        body: 'Prueba dos variantes del texto de tu página de destino para encontrar cuál convierte mejor. Sin configuración adicional — todos los datos se almacenan por página.',
        enableHeading: 'Cómo configurar una prueba',
        enableSteps: [
          'Abre una página de destino y localiza la tarjeta de Prueba A/B.',
          'Activa el interruptor.',
          'Ingresa titular, subtítulo y texto CTA alternativos para la Variante B — o haz clic en Generar con IA.',
          'Establece la división de tráfico (50/50 por defecto) y haz clic en Guardar prueba.',
          'Publica la página — los visitantes se asignan aleatoriamente a la Variante A o B y permanecen en esa variante durante la sesión.',
        ],
        resultsHeading: 'Lectura de resultados',
        resultsBody: 'La tarjeta de Resultados muestra vistas, leads y tasa de conversión por variante. Haz clic en Actualizar para refrescar los datos.',
        winnerHeading: 'Detección del ganador',
        winnerBody: 'Se declara un ganador automáticamente cuando ambas variantes alcanzan 50 vistas y una tiene una tasa de conversión 20% mayor, o ambas alcanzan 30 leads y una tiene una tasa 15% mayor.',
        resetNote: 'Usa Restablecer estadísticas para iniciar un nuevo experimento sin cambiar el texto.',
      },
      docsCta: {
        heading: '¿Listo para empezar?',
        sub: 'Crea tu primer lead magnet en menos de dos minutos.',
        button: 'Comenzar gratis',
      },
    },
  },
} as const;

export type Translations = typeof translations.en;

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: 'en', setLang: () => {} });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    const stored = localStorage.getItem('lang') as Lang | null;
    if (stored && ['en', 'fr', 'nl', 'es'].includes(stored)) setLangState(stored);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('lang', l);
  };

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLanguage() {
  const { lang, setLang } = useContext(LangContext);
  return { lang, setLang, t: translations[lang] };
}
