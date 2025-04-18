import { Link, useLocation } from "react-router";
import { useAuth } from "../../lib/auth";
import { cn } from "../../lib/utils";
import {
  Building2,
  CreditCard,
  Home,
  LogOut,
  Settings,
  User,
  Users,
} from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Accounts", href: "/accounts", icon: CreditCard },
    ...(isAdmin ? [{ name: "Admin", href: "/admin", icon: Users }] : []),
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start">
              <Link to="/" className="ml-2 flex md:mr-24">
                <Building2 className="h-8 w-8 text-primary" />
                <span className="self-center text-xl font-semibold sm:text-2xl">
                  FinnBank
                </span>
              </Link>
            </div>
            <div className="flex items-center">
              <div className="ml-3 flex items-center">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-900">
                    {user?.name}
                  </span>
                  <button
                    onClick={logout}
                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <aside className="fixed left-0 top-0 z-40 mt-16 h-screen w-64 border-r border-gray-200 bg-white pt-4">
        <div className="h-full overflow-y-auto px-3 pb-4">
          <ul className="space-y-2 font-medium">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={cn(
                      "group flex items-center rounded-lg p-2 text-gray-900 hover:bg-gray-100",
                      location.pathname === item.href && "bg-gray-100"
                    )}
                  >
                    <Icon className="h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                    <span className="ml-3">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      <main className="min-h-screen pt-16 pl-64">
        <div className="p-4">{children}</div>
      </main>
    </div>
  );
}
