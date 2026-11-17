import { Card } from "@/components/card";
import { EmptyState } from "@/components/empty-state";
import { IconClock } from "@/components/status-icons";
import { PageHeader } from "@/components/page-header";

type ComingSoonProps = {
  title: string;
  description: string;
};

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="space-y-8">
      <PageHeader title={title} description={description} />
      <Card>
        <EmptyState
          Icon={IconClock}
          title="Feature coming soon"
          description={`${title} will be available in an upcoming release.`}
        />
      </Card>
    </div>
  );
}
