import { requireAdmin } from "@/lib/admin";
import { getSettings } from "@/lib/data";
import { cloudApiEnabled } from "@/lib/whatsapp";
import { saveSettings } from "../../actions";
import SubmitButton from "@/components/admin/SubmitButton";

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await getSettings();
  const cloud = cloudApiEnabled();

  return (
    <>
      <div className="adm-head">
        <h1>Settings</h1>
      </div>
      <div className="adm-grid-2">
        <section className="adm-card">
          <h2>Store</h2>
          <form action={saveSettings} className="adm-form">
            <label className="adm-field">
              <span>WhatsApp number for orders</span>
              <input name="whatsapp_number" defaultValue={settings.whatsapp_number} placeholder="919876543210" inputMode="numeric" />
              <small>Country code + number, digits only. Customers send their orders here.</small>
            </label>
            <div className="adm-row">
              <label className="adm-field">
                <span>Shipping fee (₹)</span>
                <input name="shipping_fee" type="number" min={0} defaultValue={settings.shipping_fee} required />
              </label>
              <label className="adm-field">
                <span>Free shipping from (₹)</span>
                <input name="free_shipping_threshold" type="number" min={0} defaultValue={settings.free_shipping_threshold} required />
              </label>
            </div>
            <SubmitButton className="adm-btn adm-btn-primary" pendingText="Saving…">Save settings</SubmitButton>
          </form>
        </section>

        <section className="adm-card">
          <h2>WhatsApp</h2>
          <dl className="adm-dl">
            <dt>Click-to-chat checkout</dt>
            <dd>
              {settings.whatsapp_number ? (
                <span className="adm-ok">Active — orders go to +{settings.whatsapp_number}</span>
              ) : (
                <span className="adm-danger">Set a WhatsApp number to enable order hand-off</span>
              )}
            </dd>
            <dt>Cloud API notifications</dt>
            <dd>
              {cloud ? (
                <span className="adm-ok">Enabled</span>
              ) : (
                <span className="adm-muted">Off — add WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID to enable</span>
              )}
            </dd>
          </dl>
          <p className="adm-hint">
            With the Cloud API enabled, the number above receives a template alert for each new order, and customers can
            receive a template message whenever you change an order&rsquo;s status. See README for the templates to
            create in Meta Business Manager.
          </p>
        </section>
      </div>
    </>
  );
}
