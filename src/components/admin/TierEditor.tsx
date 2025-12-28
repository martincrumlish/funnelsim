import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, RefreshCw, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SubscriptionTier, SubscriptionTierUpdate } from "@/integrations/supabase/types";

interface TierEditorProps {
  tier: SubscriptionTier;
  onSave: (tierId: string, updates: SubscriptionTierUpdate) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

/**
 * Form component for editing subscription tier properties.
 * Includes validation for required fields and handles save/cancel actions.
 */
export const TierEditor = ({
  tier,
  onSave,
  onCancel,
  isSaving,
}: TierEditorProps) => {
  const { toast } = useToast();
  const [name, setName] = useState(tier.name);
  const [priceMonthly, setPriceMonthly] = useState(tier.price_monthly);
  const [priceYearly, setPriceYearly] = useState(tier.price_yearly);
  const [priceLifetime, setPriceLifetime] = useState(tier.price_lifetime || 0);
  const [maxFunnels, setMaxFunnels] = useState(tier.max_funnels);
  const [stripeProductId, setStripeProductId] = useState(tier.stripe_product_id || '');
  const [stripePriceIdMonthly, setStripePriceIdMonthly] = useState(tier.stripe_price_id_monthly || '');
  const [stripePriceIdYearly, setStripePriceIdYearly] = useState(tier.stripe_price_id_yearly || '');
  const [stripePriceIdLifetime, setStripePriceIdLifetime] = useState(tier.stripe_price_id_lifetime || '');
  const [registrationToken, setRegistrationToken] = useState(tier.registration_token || '');
  const [sortOrder, setSortOrder] = useState(tier.sort_order);
  const [isActive, setIsActive] = useState(tier.is_active);
  const [featuresText, setFeaturesText] = useState('');
  const [copied, setCopied] = useState(false);

  // Parse features JSON to text (one feature per line)
  useEffect(() => {
    try {
      const features = tier.features as string[] | null;
      if (Array.isArray(features)) {
        setFeaturesText(features.join('\n'));
      } else {
        setFeaturesText('');
      }
    } catch {
      setFeaturesText('');
    }
  }, [tier.features]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Parse features from text (one per line)
    const features = featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const updates: SubscriptionTierUpdate = {
      name,
      price_monthly: priceMonthly,
      price_yearly: priceYearly,
      price_lifetime: priceLifetime,
      max_funnels: maxFunnels,
      stripe_product_id: stripeProductId || null,
      stripe_price_id_monthly: stripePriceIdMonthly || null,
      stripe_price_id_yearly: stripePriceIdYearly || null,
      stripe_price_id_lifetime: stripePriceIdLifetime || null,
      registration_token: registrationToken || null,
      sort_order: sortOrder,
      is_active: isActive,
      features: features as any,
    };

    await onSave(tier.id, updates);
  };

  const generateToken = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let token = '';
    for (let i = 0; i < 16; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setRegistrationToken(token);
  };

  const copyRegistrationUrl = async () => {
    if (!registrationToken) return;
    const url = `${window.location.origin}/auth?token=${registrationToken}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Registration URL copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Copy failed",
        description: "Please copy the URL manually",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Tier: {tier.name}</CardTitle>
        <CardDescription>
          Update the tier properties. Changes will apply immediately to all users on this tier.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Tier Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Pro"
                required
                aria-label="Tier name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                min={0}
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Pricing</h4>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="priceMonthly">Monthly Price ($)</Label>
                <Input
                  id="priceMonthly"
                  type="number"
                  value={priceMonthly}
                  onChange={(e) => setPriceMonthly(parseFloat(e.target.value) || 0)}
                  min={0}
                  step={0.01}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priceYearly">Yearly Price ($)</Label>
                <Input
                  id="priceYearly"
                  type="number"
                  value={priceYearly}
                  onChange={(e) => setPriceYearly(parseFloat(e.target.value) || 0)}
                  min={0}
                  step={0.01}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priceLifetime">Lifetime Price ($)</Label>
                <Input
                  id="priceLifetime"
                  type="number"
                  value={priceLifetime}
                  onChange={(e) => setPriceLifetime(parseFloat(e.target.value) || 0)}
                  min={0}
                  step={0.01}
                  aria-label="Lifetime price"
                />
                <p className="text-xs text-muted-foreground">
                  One-time payment for permanent access
                </p>
              </div>
            </div>
          </div>

          {/* Limits */}
          <div className="space-y-2">
            <Label htmlFor="maxFunnels">Max Funnels</Label>
            <Input
              id="maxFunnels"
              type="number"
              value={maxFunnels}
              onChange={(e) => setMaxFunnels(parseInt(e.target.value, 10) || 0)}
              min={-1}
            />
            <p className="text-xs text-muted-foreground">
              Use -1 for unlimited funnels
            </p>
          </div>

          {/* Stripe IDs */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Stripe Configuration</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="stripeProductId">Product ID</Label>
                <Input
                  id="stripeProductId"
                  value={stripeProductId}
                  onChange={(e) => setStripeProductId(e.target.value)}
                  placeholder="prod_..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stripePriceIdMonthly">Monthly Price ID</Label>
                <Input
                  id="stripePriceIdMonthly"
                  value={stripePriceIdMonthly}
                  onChange={(e) => setStripePriceIdMonthly(e.target.value)}
                  placeholder="price_..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stripePriceIdYearly">Yearly Price ID</Label>
                <Input
                  id="stripePriceIdYearly"
                  value={stripePriceIdYearly}
                  onChange={(e) => setStripePriceIdYearly(e.target.value)}
                  placeholder="price_..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stripePriceIdLifetime">Lifetime Price ID</Label>
                <Input
                  id="stripePriceIdLifetime"
                  value={stripePriceIdLifetime}
                  onChange={(e) => setStripePriceIdLifetime(e.target.value)}
                  placeholder="price_..."
                  aria-label="Stripe lifetime price ID"
                />
                <p className="text-xs text-muted-foreground">
                  Stripe Price ID for one-time payment
                </p>
              </div>
            </div>
          </div>

          {/* Direct Registration (No Stripe) */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Direct Registration URL (No Stripe)</h4>
            <p className="text-xs text-muted-foreground">
              For sellers without Stripe access. Set a secret token to create a direct signup URL
              that automatically grants this tier. Use as PayPal "thank you" page redirect.
            </p>
            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor="registrationToken">Secret Token</Label>
                <Input
                  id="registrationToken"
                  value={registrationToken}
                  onChange={(e) => setRegistrationToken(e.target.value)}
                  placeholder="Leave empty to disable"
                />
              </div>
              <div className="flex items-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={generateToken}
                  title="Generate random token"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={copyRegistrationUrl}
                  disabled={!registrationToken}
                  title="Copy registration URL"
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            {registrationToken && (
              <p className="text-xs text-muted-foreground font-mono break-all">
                {window.location.origin}/auth?token={registrationToken}
              </p>
            )}
          </div>

          {/* Features */}
          <div className="space-y-2">
            <Label htmlFor="features">Features (one per line)</Label>
            <Textarea
              id="features"
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              placeholder="Enter features, one per line"
              rows={5}
            />
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="isActive">Active</Label>
            <span className="text-xs text-muted-foreground ml-2">
              Inactive tiers won't appear in the pricing page
            </span>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TierEditor;
