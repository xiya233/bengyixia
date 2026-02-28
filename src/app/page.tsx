import { getSiteSettings, getAnnouncements } from "./actions/settings";
import { AuthPageClient } from "./AuthPageClient";

export default async function AuthPage() {
  const settings = await getSiteSettings();
  const announcements = await getAnnouncements();

  return (
    <AuthPageClient
      siteTitle={settings.site_title || "蹦叽下"}
      siteDescription={settings.site_description || "每日跳绳记录"}
      registrationEnabled={settings.registration_enabled !== "false"}
      announcements={announcements}
    />
  );
}
