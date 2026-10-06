import { EmptyState, ButtonLink } from "../components/ui";
import { useSeo } from "../lib/seo";
export default function NotFound() {
  useSeo({ title: "Page not found", description: "This page doesn't exist.", path: "/404", noindex: true });
  return <div className="page py-16"><EmptyState title="This page doesn't exist" body="The link may be old. Try the shop, or answer six questions to find your system." action={<div className="flex justify-center gap-2"><ButtonLink to="/shop" variant="primary">Shop Water Filters</ButtonLink><ButtonLink to="/find-my-system" variant="outline">Find My System</ButtonLink></div>} /></div>;
}
