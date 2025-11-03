import { EventCard } from '@/components/core/event-card';
import { ExploreButton } from '@/components/main/home/explore-button';
import { events } from '@/constants/events';

export default function Page() {
  return (
    <section aria-label="Developer events">
      <h1 className="text-center">
        The Hub for Every Dev <br /> Event You Can&apos;t Miss
      </h1>
      <p className="text-medium mt-5 text-center">
        Hackathons, Meetups, and Conferences, All in One Place
      </p>

      <div className="mt-20 space-y-7">
        <h3>Featured Events</h3>

        <ul aria-label="Featured events list" className="events-layout">
          {events.map((event) => (
            <li key={event.slug}>
              <EventCard {...event} />
            </li>
          ))}
        </ul>

        <ExploreButton />
      </div>
    </section>
  );
}
