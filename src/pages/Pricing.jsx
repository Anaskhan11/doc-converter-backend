import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Clock, Zap, Shield, Sparkles } from 'lucide-react';
import { TOOL_COUNT } from '../data/toolCatalogue';

/* The toggle badge used to claim a flat "Save 20%" while the cards it sits above charge
   $9→$7 (22%) and $24→$19 (21%). Both the prices and the claim come from these numbers. */
const PRO_PRICE = { monthly: 9, yearly: 7 };
const BUSINESS_PRICE = { monthly: 24, yearly: 19 };
const savingPercent = (price) => Math.round(((price.monthly - price.yearly) / price.monthly) * 100);
const bestYearlySaving = Math.max(savingPercent(PRO_PRICE), savingPercent(BUSINESS_PRICE));

export const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: 'Free',
      desc: 'Essential document tools for everyday tasks.',
      price: '$0',
      period: 'forever',
      popular: false,
      features: [
        `Access to all ${TOOL_COUNT} document & PDF tools`,
        'Max file size up to 25 MB',
        'Standard conversion speed',
        'Automatic file deletion',
        'No signup required'
      ],
      buttonText: 'Get Started Free',
      buttonStyle: 'bg-slate-800 text-white hover:bg-slate-700'
    },
    {
      name: 'Pro',
      desc: 'Full power for professionals and power users.',
      price: isYearly ? `$${PRO_PRICE.yearly}` : `$${PRO_PRICE.monthly}`,
      period: 'per month',
      popular: true,
      comingSoon: true,
      features: [
        `Access to all ${TOOL_COUNT} document & AI tools`,
        'Max file size up to 500 MB',
        'Unlimited Chat with PDF & Summarizer',
        'Priority high-speed processing',
        'Batch multi-file conversion',
        'No advertisements'
      ],
      buttonText: 'Start Pro Trial',
      buttonStyle: 'bg-[#0bff03] text-slate-950 hover:bg-[#09e602] font-extrabold'
    },
    {
      name: 'Business',
      desc: 'Enterprise security, SLA & team seats.',
      price: isYearly ? `$${BUSINESS_PRICE.yearly}` : `$${BUSINESS_PRICE.monthly}`,
      period: 'per user / month',
      popular: false,
      comingSoon: true,
      features: [
        'Everything in Pro plan',
        'Unlimited file sizes',
        'Dedicated API access keys',
        'Custom branding on converted PDFs',
        '24/7 Priority support hotline',
        'SSO & SAML authentication'
      ],
      buttonText: 'Contact Sales',
      buttonStyle: 'bg-slate-800 text-white hover:bg-slate-700'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#0bff03]/20 border border-[#0bff03]/40 text-slate-950 dark:text-[#0bff03] text-xs font-bold uppercase">
          <Zap className="w-3.5 h-3.5" />
          <span>Simple, Transparent Pricing</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Choose the right plan for your documents
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
          Convert, edit, OCR, sign, and summarize documents with complete privacy.
        </p>

        <div className="pt-4 flex items-center justify-center space-x-4">
          <span className={`text-sm font-semibold ${!isYearly ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-600 dark:text-slate-400'}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            aria-label="Toggle billing period"
            className="w-14 h-8 bg-slate-900 dark:bg-slate-800 rounded-full p-1 transition-colors relative"
          >
            <div
              className={`w-6 h-6 rounded-full bg-[#0bff03] transition-transform ${isYearly ? 'translate-x-6' : 'translate-x-0'}`}
            />
          </button>
          <span className={`text-sm font-semibold ${isYearly ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-600 dark:text-slate-400'}`}>
            Yearly <span className="text-xs font-bold text-slate-950 dark:text-[#0bff03] bg-[#0bff03]/20 px-2 py-0.5 rounded-full">Save up to {bestYearlySaving}%</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`relative bg-white dark:bg-slate-900 rounded-3xl p-8 border transition-all flex flex-col justify-between space-y-8 ${
              plan.popular
                ? 'border-[#0bff03] shadow-2xl md:scale-[1.03]'
                : 'border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#0bff03] text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-md">
                Most Popular
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{plan.desc}</p>
              </div>

              <div className="flex items-baseline space-x-1">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{plan.price}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {plan.period}
                  {isYearly && plan.period !== 'forever' ? ', billed yearly' : ''}
                </span>
              </div>

              {plan.comingSoon && (
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
                  Planned tier &mdash; not available yet. All {TOOL_COUNT} tools are free today.
                </p>
              )}

              <ul className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
                {plan.features.map((feat, i) => (
                  <li key={i} className="flex items-center space-x-2.5">
                    {plan.comingSoon ? (
                      <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400 flex-shrink-0" aria-hidden="true" />
                    ) : (
                      <Check className="w-4 h-4 text-slate-900 dark:text-[#0bff03] flex-shrink-0" aria-hidden="true" />
                    )}
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {plan.comingSoon ? (
              <button
                disabled
                aria-disabled="true"
                className={`w-full py-3.5 rounded-2xl text-xs font-bold cursor-not-allowed opacity-50 ${plan.buttonStyle}`}
              >
                {plan.buttonText} &mdash; coming soon
              </button>
            ) : (
              <Link
                to="/tools"
                className={`w-full py-3.5 rounded-2xl text-xs font-bold transition-all shadow-xs text-center inline-flex items-center justify-center ${plan.buttonStyle}`}
              >
                {plan.buttonText}
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
