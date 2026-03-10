import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";

export const proxy = withAuth(async function middleware() { }, {
  isReturnToCurrentPage: true,
  publicPaths: ["/", "/api/inngest", "/pricing", "/checkout", "/blog", "/about", "/contact", "/terms", "/privacy", "/refund-policy", "/shipping-policy"],
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
