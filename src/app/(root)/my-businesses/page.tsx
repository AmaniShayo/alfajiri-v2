"use client";

import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useUserProfile } from "@/context/userContext";
import { useProducts } from "@/context/productProvider";
import { useBusinesses } from "@/context/businessProvider";
import { toast } from "sonner";
import { icons } from "@/constants/icons";
import { format } from "date-fns";
import { CreateBusinessDialog } from "@/components/createBusiness";
import { PlusCircle, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function MyBusinessesPage() {
  const { business, userRefetch } = useUserProfile();
  const { productsRefetch } = useProducts();
  const { businesses, businessesLoading, businessesRefetch } = useBusinesses();
  const [searchTerm, setSearchTerm] = useState("");

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingBusinessId, setPendingBusinessId] = useState<string | null>(
    null
  );

  const switchBusinessMutation = trpc.user.switchBusiness.useMutation({
    onSuccess: () => {
      toast.success("Business switched successfully");
      userRefetch();
      productsRefetch();
      setConfirmDialogOpen(false);
      setPendingBusinessId(null);
    },
    onError: (error) => {
      toast.error("Failed to switch business", {
        description: error.message,
      });
    },
  });

  const filteredBusinesses = businesses?.filter(
    (b) =>
      b.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.TINNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const currentBusinessId = business?._id;

  const handleBusinessSelect = (value: unknown) => {
    const businessId = value as string;

    if (businessId === currentBusinessId) return;

    setPendingBusinessId(businessId);
    setConfirmDialogOpen(true);
  };

  const confirmSwitch = () => {
    if (!pendingBusinessId) return;
    switchBusinessMutation.mutate({ businessId: pendingBusinessId });
  };

  const handleCancel = () => {
    setConfirmDialogOpen(false);
    setPendingBusinessId(null);
  };

  if (businessesLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full stroke-yellow-600 relative">
        <div className="absolute w-full h-full flex items-center justify-center">
          <p className="text-xs animate-bounce uppercase font-semibold text-pink-900">
            Alfajiri
          </p>
        </div>
        {icons.loading}
      </div>
    );
  }

  if (!businesses || businesses.length === 0) {
    return (
      <div className="container max-w-4xl py-20 text-center">
        <div className="mx-auto max-w-md">
          <h1 className="text-3xl font-bold mb-4">No Businesses Yet</h1>
          <p className="text-muted-foreground mb-8">
            You haven&apos;t created or been granted access to any business.
          </p>
          <Button asChild>
            <a href="/onboarding">Create Your First Business</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="relative h-full w-full">
        <div className="absolute h-12 w-full flex items-center justify-between gap-2 border-b -mt-2">
          <div className="relative max-w-md">
            <Input
              placeholder="Search businesses by name, address, or TIN"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <div className="w-fit">
            <CreateBusinessDialog
              trigger={
                <Button className="relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-yellow-600  text-white hover:bg-yellow-600/90 w-fit cursor-pointer h-fit">
                  <PlusCircle className="h-5 w-5" />
                  <span>Add Business</span>
                </Button>
              }
              onSuccess={(business) => {
                businessesRefetch();
                userRefetch();
                console.log(business);
              }}
            />
          </div>
        </div>

        <div className="absolute w-full h-[calc(100vh-96px)] overflow-y-auto mt-12 ">
          <RadioGroup
            value={currentBusinessId || ""}
            onValueChange={handleBusinessSelect}>
            <div className="gap-2 grid grid-cols-1 md:grid-cols-2">
              {filteredBusinesses?.map((business) => {
                const isActive = business._id.toString() === currentBusinessId;
                const isSwitching =
                  switchBusinessMutation.isPending &&
                  pendingBusinessId === business._id.toString();

                return (
                  <label
                    key={business._id.toString()}
                    className={`flex items-start flex-col space-y-4 rounded-lg border p-4 transition-all cursor-pointer hover:bg-accent/50 overflow-hidden ${
                      isActive
                        ? "border-yellow-600 bg-yellow-600/5"
                        : "border-border"
                    }`}>
                    <RadioGroupItem
                      value={business._id.toString()}
                      className="hidden"
                    />
                    <div className="shrink-0">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isActive
                            ? "border-yellow-600"
                            : "border-muted-foreground"
                        }`}>
                        {isActive && (
                          <div className="w-2.5 h-2.5 bg-yellow-600 rounded-full" />
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">
                          {business.businessName}
                        </h3>
                        {isActive && (
                          <Badge
                            variant="default"
                            className="bg-yellow-600 text-white">
                            Active
                          </Badge>
                        )}
                      </div>

                      <div className="text-sm text-muted-foreground mt-1 space-y-1">
                        <p>{business.address}</p>
                        {business.TINNumber && <p>TIN: {business.TINNumber}</p>}
                        <p className="text-xs">
                          Created{" "}
                          {format(
                            new Date(business.createdAt || ""),
                            "dd MMM yyyy"
                          )}
                        </p>
                      </div>
                    </div>

                    {business.productKey && (
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold whitespace-nowrap">
                          Product Key:
                        </p>
                        <Badge variant="outline" className="">
                          {business.productKey.key.length > 15
                            ? `${business.productKey.key.slice(0, 15)}...`
                            : business.productKey.key}
                        </Badge>
                      </div>
                    )}

                    {isSwitching && (
                      <div className="flex items-center gap-2 pt-2">
                        <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
                        <span className="text-xs text-yellow-600 font-medium">
                          Switching...
                        </span>
                      </div>
                    )}
                  </label>
                );
              })}
            </div>
          </RadioGroup>
          {filteredBusinesses?.length === 0 &&
            businesses &&
            businesses.length > 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No businesses found matching your search.
                </p>
              </div>
            )}
        </div>
      </div>

      {/* Confirmation Dialog - stays open until success */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch Active Business?</AlertDialogTitle>
            <AlertDialogDescription>
              This will change your currently active business across the entire
              app. All dashboards, reports, and settings will reflect the new
              business.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleCancel}
              disabled={switchBusinessMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSwitch}
              disabled={switchBusinessMutation.isPending}
              className="bg-yellow-600 hover:bg-yellow-600/90">
              {switchBusinessMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Switching...
                </>
              ) : (
                "Yes, Switch Business"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
