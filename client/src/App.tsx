import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Post from "@/pages/Post";
import ManualPost from "@/pages/ManualPost";
import ManualPostWizard from "@/pages/ManualPostWizard";
import PlatformsContent from "@/pages/PlatformsContent";
import Success from "@/pages/Success";
import Templates from "@/pages/Templates";
import Images from "@/pages/Images";
import SocialMedia from "@/pages/SocialMedia";
import Settings from "@/pages/Settings";
import Documentation from "@/pages/Documentation";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Billing from "@/pages/Billing";
import SubscriptionPlan from "@/pages/SubscriptionPlan";
import WatchDemo from "@/pages/WatchDemo";
import PendentPosts from "@/pages/PendentPosts";
import PostSchedule from "@/pages/PostSchedule";
import PostScheduleWizard from "@/pages/PostScheduleWizard";
import UserDataDeletion from "@/pages/UserDataDeletion";
import Login from "@/pages/Login";
import I18nDemo from "@/pages/I18nDemo";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/post" component={Post} />
        <Route path="/manual-post" component={ManualPost} />
        <Route path="/manual-post-wizard" component={ManualPostWizard} />
        <Route path="/platforms-content" component={PlatformsContent} />
        <Route path="/success" component={Success} />
        <Route path="/templates" component={Templates} />
        <Route path="/images" component={Images} />
        <Route path="/social-media" component={SocialMedia} />
        <Route path="/settings" component={Settings} />
        <Route path="/documentation" component={Documentation} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/billing" component={Billing} />
        <Route path="/subscription-plan" component={SubscriptionPlan} />
        <Route path="/watch-demo" component={WatchDemo} />
        <Route path="/pendent-posts" component={PendentPosts} />
        <Route path="/post-schedule" component={PostSchedule} />
        <Route path="/post-schedule-wizard" component={PostScheduleWizard} />
        <Route path="/user-data-deletion" component={UserDataDeletion} />
        <Route path="/login" component={Login} />
        <Route path="/i18n-demo" component={I18nDemo} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
