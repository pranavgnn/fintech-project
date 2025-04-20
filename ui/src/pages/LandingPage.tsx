import React from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, BarChart4 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import RootLayout from "@/components/layouts/RootLayout";

const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/signup");
    }
  };

  return (
    <RootLayout>
      <div className="flex flex-col">
        {/* Main Navbar is already included in RootLayout */}

        {/* Hero Section */}
        <section className="bg-muted/40 py-24 md:py-32">
          <div className="container px-4 md:px-8 mx-auto">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Banking Reimagined for the Digital Age
                  </h1>
                  <p className="text-muted-foreground md:text-xl">
                    Experience banking that's secure, intuitive, and designed
                    for modern life. Open an account in minutes.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" onClick={handleGetStarted}>
                    {isAuthenticated ? "Go to Dashboard" : "Get Started"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Link to="#features">
                    <Button size="lg" variant="outline">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <img
                  alt="Banking Dashboard"
                  className="aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
                  src="https://placehold.co/600x400/6c63ff/ffffff?text=FinBank+Dashboard"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 md:py-32">
          <div className="container px-4 md:px-8 mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Key Features
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Everything you need for personal and business banking, all in
                one place.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center space-y-4 p-6 border rounded-lg">
                <Shield className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Secure Banking</h3>
                <p className="text-muted-foreground">
                  Bank with confidence using our industry-leading security
                  protocols and 24/7 fraud monitoring.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4 p-6 border rounded-lg">
                <Zap className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Instant Transfers</h3>
                <p className="text-muted-foreground">
                  Send and receive money in seconds, not days, with our
                  real-time payment network.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4 p-6 border rounded-lg">
                <BarChart4 className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Financial Insights</h3>
                <p className="text-muted-foreground">
                  Get personalized insights and analytics to help you understand
                  and improve your financial health.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="bg-muted/40 py-24 md:py-32">
          <div className="container px-4 md:px-8 mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Trusted by Customers
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Hear what our customers have to say about their experience with
                FinBank.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col p-6 bg-background rounded-lg shadow">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                    RP
                  </div>
                  <div>
                    <h4 className="font-bold">Rahul P.</h4>
                    <p className="text-sm text-muted-foreground">
                      Small Business Owner
                    </p>
                  </div>
                </div>
                <p className="italic">
                  "FinBank has transformed how I manage my business finances.
                  The real-time transfers and detailed analytics give me
                  complete control."
                </p>
              </div>
              <div className="flex flex-col p-6 bg-background rounded-lg shadow">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                    AM
                  </div>
                  <div>
                    <h4 className="font-bold">Aarti M.</h4>
                    <p className="text-sm text-muted-foreground">Freelancer</p>
                  </div>
                </div>
                <p className="italic">
                  "I never knew banking could be this simple. The mobile app is
                  intuitive, and I can manage all my finances with just a few
                  taps."
                </p>
              </div>
              <div className="flex flex-col p-6 bg-background rounded-lg shadow">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                    VK
                  </div>
                  <div>
                    <h4 className="font-bold">Vikram K.</h4>
                    <p className="text-sm text-muted-foreground">Student</p>
                  </div>
                </div>
                <p className="italic">
                  "As a student, I appreciate how FinBank makes it easy to track
                  my expenses and helps me stick to my budget with their
                  financial insights."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 md:py-32">
          <div className="container px-4 md:px-8 mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Simple Pricing
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Choose the account that works best for your needs.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col p-6 border rounded-lg">
                <h3 className="text-xl font-bold">Basic Account</h3>
                <div className="mt-4 mb-4">
                  <span className="text-4xl font-bold">₹0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-muted-foreground mb-8">
                  Perfect for personal use and beginners.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <svg
                      className="h-4 w-4 mr-2 text-primary"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Free account maintenance
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-4 w-4 mr-2 text-primary"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Up to 5 free transfers/month
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-4 w-4 mr-2 text-primary"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Mobile banking access
                  </li>
                </ul>
                <Button
                  onClick={handleGetStarted}
                  variant="outline"
                  className="w-full mt-auto"
                >
                  {isAuthenticated ? "Go to Dashboard" : "Get Started"}
                </Button>
              </div>
              <div className="flex flex-col p-6 border rounded-lg bg-primary text-primary-foreground">
                <h3 className="text-xl font-bold">Premium Account</h3>
                <div className="mt-4 mb-4">
                  <span className="text-4xl font-bold">₹499</span>
                  <span className="text-primary-foreground/80">/month</span>
                </div>
                <p className="text-primary-foreground/80 mb-8">
                  For those who want more from their banking.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <svg
                      className="h-4 w-4 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Everything in Basic
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-4 w-4 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Unlimited transfers
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-4 w-4 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Priority customer support
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-4 w-4 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Financial planning tools
                  </li>
                </ul>
                <Link to="/signup" className="mt-auto">
                  <Button variant="secondary" className="w-full">
                    Get Premium
                  </Button>
                </Link>
              </div>
              <div className="flex flex-col p-6 border rounded-lg">
                <h3 className="text-xl font-bold">Business Account</h3>
                <div className="mt-4 mb-4">
                  <span className="text-4xl font-bold">₹999</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-muted-foreground mb-8">
                  Tailored for businesses of all sizes.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <svg
                      className="h-4 w-4 mr-2 text-primary"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Everything in Premium
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-4 w-4 mr-2 text-primary"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Multiple user accounts
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-4 w-4 mr-2 text-primary"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Business analytics
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-4 w-4 mr-2 text-primary"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    API access for integration
                  </li>
                </ul>
                <Link to="/signup" className="mt-auto">
                  <Button variant="outline" className="w-full">
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary text-primary-foreground py-16 md:py-24">
          <div className="container px-4 md:px-8 mx-auto">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Ready to experience better banking?
                </h2>
                <p className="mt-4 text-primary-foreground/80 md:text-xl">
                  Join thousands of satisfied customers who have switched to
                  FinBank.
                </p>
              </div>
              <div className="flex flex-col gap-4 min-[400px]:flex-row justify-end">
                {isAuthenticated ? (
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={() => navigate("/dashboard")}
                  >
                    Go to Dashboard
                  </Button>
                ) : (
                  <>
                    <Button
                      size="lg"
                      variant="secondary"
                      onClick={() => navigate("/signup")}
                    >
                      Open an Account
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => navigate("/login")}
                      className="bg-transparent text-primary-foreground border-primary-foreground"
                    >
                      Login
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Footer is already included in RootLayout */}
      </div>
    </RootLayout>
  );
};

export default LandingPage;
