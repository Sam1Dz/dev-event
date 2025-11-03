'use client';

import { Button } from '@heroui/react';
import { HiArrowRightCircle } from 'react-icons/hi2';

export function ExploreButton() {
  return (
    <div className="flex justify-center">
      <Button
        aria-label="View all developer events"
        className="text-medium font-medium"
        endContent={<HiArrowRightCircle aria-hidden="true" size={24} />}
        radius="full"
        size="lg"
        variant="shadow"
      >
        Explore All Events
      </Button>
    </div>
  );
}
