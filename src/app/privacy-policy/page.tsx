// app/privacy/page.tsx
import { Suspense } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const metadata = {
  title: "Privacy Policy",
  description: "How we handle your data and protect your privacy",
};

async function getPrivacyContent() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/privacy-policy.md`,
      { cache: "force-cache" }
    );

    if (!res.ok) throw new Error("Failed to load privacy policy");
    return await res.text();
  } catch (error) {
    console.error(error);
    return "# Privacy Policy\n\nSorry, we could not load the privacy policy at this moment.";
  }
}

export default async function PrivacyPage() {
  const markdown = await getPrivacyContent();

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="py-20 text-center text-gray-500">
              Loading Privacy Policy...
            </div>
          }>
          <article
            className="
            prose 
            prose-slate 
            max-w-none 
            dark:prose-invert 
            prose-headings:scroll-mt-20
            prose-a:text-blue-600 
            dark:prose-a:text-blue-400
          ">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {markdown}
            </ReactMarkdown>
          </article>
        </Suspense>

        <div className="mt-16 border-t border-gray-200 pt-8 dark:border-gray-800">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Last updated: January 9, 2026
          </p>
        </div>
      </div>
    </main>
  );
}
