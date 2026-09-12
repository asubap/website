import React, { useState, useEffect } from "react";
import { ProcessStep } from "../../components/ui/ProcessStep";
import { ProcessArrow } from "../../components/ui/ProcessArrow";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { useAuth } from "../../context/auth/authProvider";
import { getNavLinks } from "../../components/nav/NavLink";
import { membershipDefaults } from "../../content/pageDefaults";
import { usePageContent } from "../../hooks/usePageContent";
import PageEditBar from "../../components/pageEditing/PageEditBar";
import EditableText from "../../components/pageEditing/EditableText";

export const ProcessFlow = () => {
  const { isAuthenticated } = useAuth();
  const page = usePageContent('membership', membershipDefaults);
  const { content, isEditing } = page;
  const [applyFormUrl, setApplyFormUrl] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, '')}/links?link_name=forms`, { signal: controller.signal })
      .then(async response => { if (response.ok) { const data = await response.json(); setApplyFormUrl(data[0]?.link || ''); } })
      .catch(error => { if (!controller.signal.aborted) console.error('Error fetching apply form URL:', error); });
    return () => controller.abort();
  }, []);

  const applicationUrl = content.applicationUrl || applyFormUrl;
  const safeApplicationUrl = /^https?:\/\//i.test(applicationUrl) ? applicationUrl : '';
  const updateRequirement = (stepIndex: number, requirementIndex: number, value: string) => page.setDraft(current => ({
    ...current, steps: current.steps.map((step, index) => index === stepIndex ? {
      ...step, requirements: step.requirements.map((requirement, i) => i === requirementIndex ? value : requirement),
    } : step),
  }));

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar isLogged={isAuthenticated} links={getNavLinks(isAuthenticated)} title="Beta Alpha Psi | Beta Tau Chapter" backgroundColor="#FFFFFF" outlineColor="#AF272F" />
      <main className="flex-grow p-8 pt-32 px-8 sm:px-16 lg:px-24 flex flex-col items-center">
        <PageEditBar {...page} />
        <fieldset disabled={page.saving} className="min-w-0 w-full">
          <legend className="sr-only">Membership page content</legend>
          {isEditing ? <EditableText label="Page title" value={content.title} onChange={title => page.setDraft(current => ({ ...current, title }))} maxLength={120} />
            : <h1 className="text-3xl sm:text-4xl md:text-5xl font-outfit font-bold text-bapred mb-6 text-center">{content.title}</h1>}
          {isEditing ? <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            {content.steps.map((step, stepIndex) => <div key={stepIndex} className="min-w-0 rounded-lg bg-white p-5 shadow-md">
              <EditableText label={`Step ${stepIndex + 1} title`} value={step.title} maxLength={120} onChange={title => page.setDraft(current => ({ ...current, steps: current.steps.map((step, index) => index === stepIndex ? { ...step, title } : step) }))} />
              {step.requirements.map((requirement, index) => <div key={index} className="mb-5 border-b pb-3">
                <EditableText label={`Step ${stepIndex + 1}, requirement ${index + 1}`} value={requirement} multiline maxLength={2000} onChange={value => updateRequirement(stepIndex, index, value)} />
                <button type="button" disabled={step.requirements.length <= 1} className="text-sm text-bapred underline disabled:opacity-40" aria-label={`Remove step ${stepIndex + 1}, requirement ${index + 1}`} onClick={() => page.setDraft(current => ({ ...current, steps: current.steps.map((step, i) => i === stepIndex ? { ...step, requirements: step.requirements.filter((_, j) => j !== index) } : step) }))}>Remove requirement</button>
              </div>)}
              <button type="button" disabled={step.requirements.length >= 20} className="rounded-md border border-bapred px-3 py-2 text-bapred disabled:opacity-40" onClick={() => page.setDraft(current => ({ ...current, steps: current.steps.map((step, index) => index === stepIndex ? { ...step, requirements: [...step.requirements, ''] } : step) }))}>Add requirement</button>
            </div>)}
          </div> : <>
            <div className="hidden md:flex justify-center items-stretch gap-8 mb-16">
              {content.steps.map((step, index) => <React.Fragment key={index}>
                <div className="flex-1 max-w-md"><ProcessStep {...step} /></div>
                {index < content.steps.length - 1 && <div className="flex items-center justify-center w-10"><ProcessArrow /></div>}
              </React.Fragment>)}
            </div>
            <div className="md:hidden space-y-6 mb-12">
              {content.steps.map((step, index) => <React.Fragment key={index}>
                <ProcessStep {...step} />
                {index < content.steps.length - 1 && <div className="py-2 flex justify-center"><div className="w-10 transform rotate-90"><ProcessArrow /></div></div>}
              </React.Fragment>)}
            </div>
          </>}
          <div className="text-center mt-8">
            {isEditing ? <div className="mx-auto max-w-2xl text-left">
              <EditableText label="Application button text" value={content.applicationLabel} maxLength={120} onChange={applicationLabel => page.setDraft(current => ({ ...current, applicationLabel }))} />
              <EditableText label="Application link (leave blank to use the current application form)" value={content.applicationUrl} maxLength={2048} onChange={applicationUrl => page.setDraft(current => ({ ...current, applicationUrl }))} />
              {applyFormUrl && <p className="text-sm text-gray-600 break-all">Current application form: {applyFormUrl}</p>}
            </div> : <button className="text-white text-xl md:text-2xl font-bold px-8 py-4 bg-bapred hover:bg-[#8f1f25] transition-colors rounded-md shadow-md disabled:opacity-50" disabled={!safeApplicationUrl} onClick={() => window.open(safeApplicationUrl, '_blank', 'noopener,noreferrer')}>{content.applicationLabel}</button>}
          </div>
          <div className="mt-16 mb-16 max-w-4xl mx-auto px-4 py-6 border-t border-gray-200">
            {isEditing ? <EditableText label="Membership footnote" value={content.footnote} multiline onChange={footnote => page.setDraft(current => ({ ...current, footnote }))} />
              : <p className="text-gray-700 text-base md:text-lg leading-relaxed font-light italic"><span className="text-bapred font-medium mr-1">*</span>{content.footnote}</p>}
          </div>
        </fieldset>
        {isEditing && <PageEditBar {...page} />}
      </main>
      <Footer backgroundColor="#AF272F" />
    </div>
  );
};
