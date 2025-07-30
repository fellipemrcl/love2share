"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
  backHref?: string;
  breadcrumbItems?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

const PageHeader = ({ 
  title, 
  description, 
  showBackButton = false, 
  backHref,
  breadcrumbItems,
  actions 
}: PageHeaderProps) => {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <div className="relative z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        {breadcrumbItems && breadcrumbItems.length > 0 && (
          <div className="mb-4">
            <Breadcrumb items={breadcrumbItems} />
          </div>
        )}

        {/* Header Content */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleBack}
                className="shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            
            <div>
              <h1 className="text-2xl font-bold leading-tight tracking-tight md:text-3xl">
                {title}
              </h1>
              {description && (
                <p className="text-muted-foreground mt-1">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
