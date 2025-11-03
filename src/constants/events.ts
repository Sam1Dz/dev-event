export const events = [
  {
    title: 'React Conf 2025',
    image: '/images/event1.png',
    slug: 'react-conf-2025',
    location: 'Las Vegas, NV',
    date: 'May 15-16, 2025',
    time: '9:00 AM - 6:00 PM',
  },
  {
    title: 'JSConf EU 2025',
    image: '/images/event2.png',
    slug: 'jsconf-eu-2025',
    location: 'Berlin, Germany',
    date: 'June 2-4, 2025',
    time: '10:00 AM - 7:00 PM',
  },
  {
    title: 'PyCon US 2025',
    image: '/images/event3.png',
    slug: 'pycon-us-2025',
    location: 'Pittsburgh, PA',
    date: 'May 14-22, 2025',
    time: '8:00 AM - 5:00 PM',
  },
  {
    title: 'Google I/O 2025',
    image: '/images/event4.png',
    slug: 'google-io-2025',
    location: 'Mountain View, CA',
    date: 'May 20-22, 2025',
    time: '9:00 AM - 6:00 PM',
  },
  {
    title: 'Hacktoberfest 2025',
    image: '/images/event5.png',
    slug: 'hacktoberfest-2025',
    location: 'Online',
    date: 'October 1-31, 2025',
    time: 'All Day',
  },
  {
    title: 'TestCon Europe 2025',
    image: '/images/event6.png',
    slug: 'testcon-europe-2025',
    location: 'Vilnius, Lithuania & Online',
    date: 'October 2025',
    time: 'TBD',
  },
];

export type EventType = (typeof events)[number];
