'use client';

import Image from 'next/image';

export function BoltBadge() {
  return (
    <div className="fixed top-4 right-4 z-50">
      <a
        href="https://bolt.new/"
        target="_blank"
        rel="noopener noreferrer"
        className="block transition-transform duration-300 hover:scale-110"
        title="Built with Bolt.new"
      >
        <div className="relative w-[100px] h-[100px] animate-spin-slow">
          <Image
            src="/files_2476570-1751139500618-black_circle_360x360.svg"
            alt="Bolt.new"
            width={100}
            height={100}
            className="w-full h-full object-contain"
            priority
          />
        </div>
      </a>
    </div>
  );
}