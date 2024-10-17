import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Loader,
  ExternalLink,
  Briefcase,
  Users,
  Shield,
  Zap,
  Lock,
  Award,
} from "lucide-react";

const DomainPanel = ({
  customDomain,
  setCustomDomain,
  handleCustomDomainSubmit,
  showDNSInstructions,
  handleConfirmDomain,
  isConnectingDomain,
  domainStatus,
  customDomainStatus,
}) => {
  const renderDomainContent = () => {
    if (domainStatus === "pending") {
      return (
        <div className="space-y-6">
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 m-2 flex items-center space-x-3">
            <Loader className="text-blue-500 w-6 h-6 animate-spin" />
            <div>
              <h3 className="font-semibold text-blue-700">
                Domain Connection in Progress
              </h3>
              <p className="text-blue-600">{customDomain}</p>
            </div>
          </div>
          <div className="bg-black-500 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold">What's happening now?</h3>
            <ul className="space-y-3">
              {[
                "Verifying DNS records",
                "Provisioning SSL certificate",
                "Configuring server settings",
                "Testing connection",
              ].map((step, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-gray-600">
              This process typically takes up to 24 hours. We'll send you an
              email confirmation once your domain is live.
            </p>
          </div>
        </div>
      );
    } else if (customDomainStatus && customDomainStatus.is_connected) {
      return (
        <div className="space-y-6 p-4 sm:p-2">
          <div className="bg-green-100 border border-green-300 rounded-lg p-4 flex items-center space-x-3">
            <CheckCircle className="text-green-500 w-6 h-6" />
            <div>
              <h3 className="font-semibold text-green-700">
                Your portfolio is live on
              </h3>
              <p className="text-green-600">
                <a
                  href={`https://${customDomainStatus.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:underline"
                >
                  {customDomainStatus.domain}
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </p>
            </div>
          </div>
          <h3 className="text-xl font-semibold">
            Benefits of Your Custom Domain
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
            {[
              {
                icon: Lock,
                title: "Free SSL Certificate",
                description: "Secure your site with HTTPS",
              },
              {
                icon: Briefcase,
                title: "Professional Branding",
                description: "Enhance your online presence",
              },
              {
                icon: Users,
                title: "Improved Credibility",
                description: "Build trust with your audience",
              },
              {
                icon: Shield,
                title: "Full Control",
                description: "Manage your online identity",
              },
              {
                icon: Zap,
                title: "Better SEO",
                description: "Improve search engine rankings",
              },
              {
                icon: Award,
                title: "Stand Out",
                description: "Differentiate from competitors",
              },
            ].map((benefit, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-3 bg-card rounded-lg"
              >
                <benefit.icon className="w-6 h-6 text-primary" />
                <div>
                  <h4 className="font-semibold">{benefit.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-6">
          {!showDNSInstructions ? (
            <div className="p-4 sm:p-1">
              <h3 className="text-xl font-semibold mb-4">
                Connect Your Custom Domain
              </h3>
              <form onSubmit={handleCustomDomainSubmit}>
                <div className="flex flex-col space-y-2">
                  <label htmlFor="customDomain" className="text-sm font-medium">
                    Enter your domain or subdomain:
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      id="customDomain"
                      type="text"
                      placeholder="e.g., portfolio.yourdomain.com"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      className="flex-grow"
                    />
                    <Button type="submit" disabled={!customDomain}>
                      Connect
                    </Button>
                  </div>
                </div>
              </form>
              <div className="grid grid-cols-1 gap-4 mt-4">
                {[
                  {
                    icon: Briefcase,
                    title: "Professional Branding",
                    description:
                      "Establish a strong, memorable online identity",
                  },
                  {
                    icon: Users,
                    title: "Improved Visibility",
                    description:
                      "Increase discoverability for potential clients",
                  },
                  {
                    icon: Shield,
                    title: "Enhanced Credibility",
                    description: "Build trust with a professional web address",
                  },
                  {
                    icon: Zap,
                    title: "Better SEO",
                    description: "Improve your search engine rankings",
                  },
                ].map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 rounded-lg"
                  >
                    <benefit.icon className="text-primary w-6 h-6 mt-1" />
                    <div>
                      <h4 className="font-semibold">{benefit.title}</h4>
                      <p className="text-sm text-gray-600">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className=" p-4 space-y-4">
              <h3 className="text-xl font-semibold">
                DNS Configuration Instructions
              </h3>
              <p>
                To connect your domain <b>{customDomain}</b> please add the
                following A record to your domain's DNS settings:
              </p>
              <div className="bg-gray-700/20 p-4 rounded-lg space-y-2">
                <p>
                  <strong>Type:</strong> A
                </p>
                <p>
                  <strong>Name:</strong> @ or portfolio (or your subdomain)
                </p>
                <p>
                  <strong>Value:</strong> 184.164.80.42
                </p>
              </div>
              <p>Once you've added the DNS record, click Confirm</p>
              <Button
                onClick={handleConfirmDomain}
                disabled={isConnectingDomain}
                className="w-full"
              >
                {isConnectingDomain ? "Connecting..." : "Confirm DNS Settings"}
              </Button>
            </div>
          )}
        </div>
      );
    }
  };

  return renderDomainContent();
};

export default DomainPanel;
