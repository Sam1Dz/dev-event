'use client';

import { Card, CardBody } from '@heroui/react';
import NextImage from 'next/image';
import NextLink from 'next/link';
import { HiCalendarDateRange, HiClock, HiMapPin } from 'react-icons/hi2';

import type { EventType } from '@/constants/events';

/**
 * Displays an event as a pressable card with image, title, location, date, and time.
 * Renders as a semantic link with accessible aria-label.
 * @param {EventType} props - Event data including date, image, location, time, and title
 */
export function EventCard({ date, image, location, time, title }: EventType) {
  return (
    <NextLink
      aria-label={`${title} event - ${date} at ${time} in ${location}`}
      href="#"
    >
      <Card isBlurred isPressable className="h-full w-full" shadow="sm">
        <NextImage
          alt={`${title} event banner`}
          className="h-64 w-full"
          height={256}
          src={image}
          width={512}
        />

        <CardBody className="flex flex-col gap-2">
          <div className="flex flex-row items-center gap-2">
            <HiMapPin aria-hidden="true" className="text-foreground/80" />
            <p className="text-tiny text-foreground/80 font-mono font-extralight">
              {location}
            </p>
          </div>

          <p className="line-clamp-1 text-xl font-semibold">{title}</p>

          <div className="text-foreground/80 flex flex-row flex-wrap items-center gap-4">
            <div className="flex flex-row gap-2">
              <HiCalendarDateRange aria-hidden="true" />
              <p className="text-tiny font-mono font-extralight">{date}</p>
            </div>
            <div className="flex flex-row gap-2">
              <HiClock aria-hidden="true" />
              <p className="text-tiny font-mono font-extralight">{time}</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </NextLink>
  );
}
