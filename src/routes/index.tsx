import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AdminLayout } from '@/layouts/AdminLayout'
import { RequireAuth, RequireRole } from '@/lib/auth/RequireRole'
import { RouteError } from '@/components/feedback/RouteError'
import { LoginPage } from '@/features/auth/LoginPage'
import { ProfilePage } from '@/features/profile/ProfilePage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { UsersListPage } from '@/features/users/UsersListPage'
import { UserDetailPage } from '@/features/users/UserDetailPage'
import { UserFormPage } from '@/features/users/UserFormPage'
import { ServicesListPage } from '@/features/services/ServicesListPage'
import { ServiceFormPage } from '@/features/services/ServiceFormPage'
import { ServiceDetailPage } from '@/features/services/ServiceDetailPage'
import { OrdersListPage } from '@/features/orders/OrdersListPage'
import { OrderDetailPage } from '@/features/orders/OrderDetailPage'
import { PurgeFilesPage } from '@/features/orders/PurgeFilesPage'
import { CustomersListPage } from '@/features/customers/CustomersListPage'
import { CustomerDetailPage } from '@/features/customers/CustomerDetailPage'
import { CustomerFormPage } from '@/features/customers/CustomerFormPage'
import { BlogsListPage } from '@/features/blogs/BlogsListPage'
import { BlogFormPage } from '@/features/blogs/BlogFormPage'
import { FaqsListPage } from '@/features/faqs/FaqsListPage'
import { FaqFormPage } from '@/features/faqs/FaqFormPage'
import { TestimonialsListPage } from '@/features/testimonials/TestimonialsListPage'
import { TestimonialFormPage } from '@/features/testimonials/TestimonialFormPage'
import { CareersListPage } from '@/features/careers/CareersListPage'
import { CareerFormPage } from '@/features/careers/CareerFormPage'
import { ContentListPage } from '@/features/content/ContentListPage'
import { ContentNewPage } from '@/features/content/ContentNewPage'
import { ContentEditPage } from '@/features/content/ContentEditPage'
import { SectionEditPage } from '@/features/content/SectionEditPage'
import { PageMetaListPage } from '@/features/page-meta/PageMetaListPage'
import { PageMetaFormPage } from '@/features/page-meta/PageMetaFormPage'
import { CouponsListPage } from '@/features/coupons/CouponsListPage'
import { CouponFormPage } from '@/features/coupons/CouponFormPage'
import { PaymentLinksListPage } from '@/features/payment-links/PaymentLinksListPage'
import { PaymentLinkFormPage } from '@/features/payment-links/PaymentLinkFormPage'
import { RecurringOrdersListPage } from '@/features/recurring-orders/RecurringOrdersListPage'
import { RecurringOrderFormPage } from '@/features/recurring-orders/RecurringOrderFormPage'
import { ConsultationEventsPage } from '@/features/consultation-events/ConsultationEventsPage'
import { RemedyEventsPage } from '@/features/remedy-events/RemedyEventsPage'
import { CalendarEventsListPage } from '@/features/calendar-events/CalendarEventsListPage'
import { CalendarEventFormPage } from '@/features/calendar-events/CalendarEventFormPage'
import { DisclaimerBannerPage } from '@/features/disclaimer-banner/DisclaimerBannerPage'
import { NotFoundPage } from './notFound'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage />, errorElement: <RouteError /> },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AdminLayout />
      </RequireAuth>
    ),
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'profile', element: <ProfilePage /> },

      // Users
      {
        path: 'users',
        element: (
          <RequireRole resource="users" action="read">
            <UsersListPage />
          </RequireRole>
        ),
      },
      {
        path: 'users/new',
        element: (
          <RequireRole resource="users" action="write">
            <UserFormPage />
          </RequireRole>
        ),
      },
      {
        path: 'users/:id',
        element: (
          <RequireRole resource="users" action="read">
            <UserDetailPage />
          </RequireRole>
        ),
      },
      {
        path: 'users/:id/edit',
        element: (
          <RequireRole resource="users" action="write">
            <UserFormPage />
          </RequireRole>
        ),
      },

      // Services
      {
        path: 'services',
        element: (
          <RequireRole resource="services" action="read">
            <ServicesListPage />
          </RequireRole>
        ),
      },
      {
        path: 'services/new',
        element: (
          <RequireRole resource="services" action="write">
            <ServiceFormPage />
          </RequireRole>
        ),
      },
      {
        path: 'services/:id',
        element: (
          <RequireRole resource="services" action="read">
            <ServiceDetailPage />
          </RequireRole>
        ),
      },
      {
        path: 'services/:id/edit',
        element: (
          <RequireRole resource="services" action="write">
            <ServiceFormPage />
          </RequireRole>
        ),
      },

      // Orders
      {
        path: 'orders',
        element: (
          <RequireRole resource="orders" action="read">
            <OrdersListPage />
          </RequireRole>
        ),
      },
      {
        path: 'orders/maintenance',
        element: (
          <RequireRole resource="orders" action="write">
            <PurgeFilesPage />
          </RequireRole>
        ),
      },
      {
        path: 'orders/:id',
        element: (
          <RequireRole resource="orders" action="read">
            <OrderDetailPage />
          </RequireRole>
        ),
      },

      // Customers
      {
        path: 'customers',
        element: (
          <RequireRole resource="customers" action="read">
            <CustomersListPage />
          </RequireRole>
        ),
      },
      {
        path: 'customers/new',
        element: (
          <RequireRole resource="customers" action="write">
            <CustomerFormPage />
          </RequireRole>
        ),
      },
      {
        path: 'customers/:id',
        element: (
          <RequireRole resource="customers" action="read">
            <CustomerDetailPage />
          </RequireRole>
        ),
      },

      // Blogs
      {
        path: 'blogs',
        element: (
          <RequireRole resource="blogs" action="read">
            <BlogsListPage />
          </RequireRole>
        ),
      },
      {
        path: 'blogs/new',
        element: (
          <RequireRole resource="blogs" action="write">
            <BlogFormPage />
          </RequireRole>
        ),
      },
      {
        path: 'blogs/:id/edit',
        element: (
          <RequireRole resource="blogs" action="write">
            <BlogFormPage />
          </RequireRole>
        ),
      },

      // FAQs
      {
        path: 'faqs',
        element: (
          <RequireRole resource="faqs" action="read">
            <FaqsListPage />
          </RequireRole>
        ),
      },
      {
        path: 'faqs/new',
        element: (
          <RequireRole resource="faqs" action="write">
            <FaqFormPage />
          </RequireRole>
        ),
      },
      {
        path: 'faqs/:id/edit',
        element: (
          <RequireRole resource="faqs" action="write">
            <FaqFormPage />
          </RequireRole>
        ),
      },

      // Testimonials
      {
        path: 'testimonials',
        element: (
          <RequireRole resource="testimonials" action="read">
            <TestimonialsListPage />
          </RequireRole>
        ),
      },
      {
        path: 'testimonials/new',
        element: (
          <RequireRole resource="testimonials" action="write">
            <TestimonialFormPage />
          </RequireRole>
        ),
      },
      {
        path: 'testimonials/:id/edit',
        element: (
          <RequireRole resource="testimonials" action="write">
            <TestimonialFormPage />
          </RequireRole>
        ),
      },

      // Careers
      {
        path: 'careers',
        element: (
          <RequireRole resource="careers" action="read">
            <CareersListPage />
          </RequireRole>
        ),
      },
      {
        path: 'careers/new',
        element: (
          <RequireRole resource="careers" action="write">
            <CareerFormPage />
          </RequireRole>
        ),
      },
      {
        path: 'careers/:id/edit',
        element: (
          <RequireRole resource="careers" action="write">
            <CareerFormPage />
          </RequireRole>
        ),
      },

      // Page Content
      {
        path: 'content',
        element: (
          <RequireRole resource="content" action="read">
            <ContentListPage />
          </RequireRole>
        ),
      },
      {
        path: 'content/new',
        element: (
          <RequireRole resource="content" action="write">
            <ContentNewPage />
          </RequireRole>
        ),
      },
      {
        path: 'content/:page/edit',
        element: (
          <RequireRole resource="content" action="write">
            <ContentEditPage />
          </RequireRole>
        ),
      },
      {
        path: 'content/:page/sections/:key',
        element: (
          <RequireRole resource="content" action="write">
            <SectionEditPage />
          </RequireRole>
        ),
      },

      // Coupons
      {
        path: 'coupons',
        element: (
          <RequireRole resource="coupons" action="read">
            <CouponsListPage />
          </RequireRole>
        ),
      },
      {
        path: 'coupons/new',
        element: (
          <RequireRole resource="coupons" action="write">
            <CouponFormPage />
          </RequireRole>
        ),
      },
      {
        path: 'coupons/:id/edit',
        element: (
          <RequireRole resource="coupons" action="write">
            <CouponFormPage />
          </RequireRole>
        ),
      },

      // Payment Links
      {
        path: 'payment-links',
        element: (
          <RequireRole resource="paymentLinks" action="read">
            <PaymentLinksListPage />
          </RequireRole>
        ),
      },
      {
        path: 'payment-links/new',
        element: (
          <RequireRole resource="paymentLinks" action="write">
            <PaymentLinkFormPage />
          </RequireRole>
        ),
      },

      // Recurring Orders
      {
        path: 'recurring-orders',
        element: (
          <RequireRole resource="paymentLinks" action="read">
            <RecurringOrdersListPage />
          </RequireRole>
        ),
      },
      {
        path: 'recurring-orders/new',
        element: (
          <RequireRole resource="paymentLinks" action="write">
            <RecurringOrderFormPage />
          </RequireRole>
        ),
      },

      // Page SEO Meta
      {
        path: 'page-meta',
        element: (
          <RequireRole resource="pageMeta" action="read">
            <PageMetaListPage />
          </RequireRole>
        ),
      },
      {
        path: 'page-meta/new',
        element: (
          <RequireRole resource="pageMeta" action="write">
            <PageMetaFormPage />
          </RequireRole>
        ),
      },
      {
        path: 'page-meta/:id/edit',
        element: (
          <RequireRole resource="pageMeta" action="write">
            <PageMetaFormPage />
          </RequireRole>
        ),
      },

      // Consultation Events
      {
        path: 'consultation-events',
        element: (
          <RequireRole resource="consultationEvents" action="read">
            <ConsultationEventsPage />
          </RequireRole>
        ),
      },

      // Remedy Events
      {
        path: 'remedy-events',
        element: (
          <RequireRole resource="remedyEvents" action="read">
            <RemedyEventsPage />
          </RequireRole>
        ),
      },

      // Calendar Events (manifestation calendar)
      {
        path: 'calendar-events',
        element: (
          <RequireRole resource="calendarEvents" action="read">
            <CalendarEventsListPage />
          </RequireRole>
        ),
      },
      {
        path: 'calendar-events/new',
        element: (
          <RequireRole resource="calendarEvents" action="write">
            <CalendarEventFormPage />
          </RequireRole>
        ),
      },
      {
        path: 'calendar-events/:id/edit',
        element: (
          <RequireRole resource="calendarEvents" action="write">
            <CalendarEventFormPage />
          </RequireRole>
        ),
      },

      // Disclaimer Banner (header scrolling banner)
      {
        path: 'disclaimer-banner',
        element: (
          <RequireRole resource="disclaimerBanner" action="read">
            <DisclaimerBannerPage />
          </RequireRole>
        ),
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
], { basename: import.meta.env.BASE_URL })
