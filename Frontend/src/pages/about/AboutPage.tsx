import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import BAPMap from "../../assets/BAP_Map.png";
import { getNavLinks } from "../../components/nav/NavLink";
import { useAuth } from "../../context/auth/authProvider";
import { aboutDefaults, AboutContent } from "../../content/pageDefaults";
import { usePageContent } from "../../hooks/usePageContent";
import PageEditBar from "../../components/pageEditing/PageEditBar";
import EditableText from "../../components/pageEditing/EditableText";
import EditableRichText from "../../components/pageEditing/EditableRichText";

export default function AboutPage() {
  const { isAuthenticated } = useAuth();
  const page = usePageContent('about', aboutDefaults);
  const { content, isEditing } = page;
  const update = (key: keyof AboutContent, value: string) => page.setDraft(current => ({ ...current, [key]: value }));

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar isLogged={isAuthenticated} links={getNavLinks(isAuthenticated)} title="Beta Alpha Psi | Beta Tau Chapter" backgroundColor="#FFFFFF" outlineColor="#AF272F" />
      <main className="flex-grow p-8 pt-32 px-8 sm:px-16 lg:px-24">
        <PageEditBar {...page} />
        <fieldset disabled={page.saving} className="min-w-0">
          <legend className="sr-only">About Us page content</legend>
          {isEditing ? <EditableText label="Page title" value={content.title} onChange={value => update('title', value)} maxLength={120} />
            : <h1 className="text-3xl sm:text-4xl md:text-5xl font-outfit font-bold text-bapred mb-6 text-center sm:text-left">{content.title}</h1>}
          <div className="mb-6 sm:mb-10 pt-4">
            <EditableRichText label="Introduction" value={content.introduction} editing={isEditing} disabled={page.saving} onChange={value => update('introduction', value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mb-8 md:mb-12">
            <div className="order-2 md:order-1">
              {isEditing ? <EditableText label="Vision heading" value={content.visionTitle} onChange={value => update('visionTitle', value)} maxLength={120} />
                : <h2 className="text-xl sm:text-2xl font-bold font-outfit text-bapred mb-4 mt-6 md:mt-0">{content.visionTitle}</h2>}
              <div className="mb-6"><EditableRichText label="Vision" value={content.vision} editing={isEditing} disabled={page.saving} onChange={value => update('vision', value)} /></div>
              {isEditing ? <EditableText label="Mission heading" value={content.missionTitle} onChange={value => update('missionTitle', value)} maxLength={120} />
                : <h2 className="text-xl sm:text-2xl font-bold font-outfit text-bapred mb-4">{content.missionTitle}</h2>}
              <EditableRichText label="Mission" value={content.mission} editing={isEditing} disabled={page.saving} onChange={value => update('mission', value)} />
            </div>
            <div className="bg-gray-100 rounded-lg overflow-hidden order-1 md:order-2 self-start">
              <div className="relative aspect-video">
                <iframe src="https://player.vimeo.com/video/84151038?h=ecba82566f&color=AF272F&title=0&byline=0&portrait=0" className="absolute inset-0 w-full h-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title="Why Beta Alpha Psi?" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mb-8 md:mb-12">
            <div className="md:pr-4"><img src={BAPMap} alt="Beta Alpha Psi Chapter Map with ASU Beta Tau Chapter highlighted" className="w-full h-auto rounded-lg shadow-md" /></div>
            <div>
              <div className="mb-4 mt-4 md:mt-0"><EditableRichText label="Chapter introduction" value={content.chapterIntroduction} editing={isEditing} disabled={page.saving} onChange={value => update('chapterIntroduction', value)} /></div>
              <EditableRichText label="Chapter activities" value={content.chapterActivities} editing={isEditing} disabled={page.saving} onChange={value => update('chapterActivities', value)} />
            </div>
          </div>
        </fieldset>
        {isEditing && <PageEditBar {...page} />}
      </main>
      <Footer backgroundColor="#AF272F" />
    </div>
  );
}
