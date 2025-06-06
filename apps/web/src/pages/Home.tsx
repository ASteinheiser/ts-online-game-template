import { useRef } from 'react';
import { useQuery, gql } from '@apollo/client';
import { cn } from '@repo/ui';
import { ChevronDown } from '@repo/ui/icons';
import { GetBooksQuery, GetBooksQueryVariables } from '../graphql';
import { useSession } from '../router/SessionContext';

const GET_BOOKS = gql`
  query GetBooks {
    books {
      title
      author
    }
  }
`;

export const Home = () => {
  const { session } = useSession();
  const { data } = useQuery<GetBooksQuery, GetBooksQueryVariables>(GET_BOOKS);

  const homeContentRef = useRef<HTMLDivElement>(null);

  const handleScollToContent = () => {
    homeContentRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  console.log({ gqlData: data });
  console.log({ session });

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col md:flex-row justify-center items-center gap-8 h-screen mt-nav">
        <img src="/logo.svg" alt="logo" className="w-40 h-40 md:w-50 md:h-50 hover:animate-ping" />

        <div className="w-[2px] h-40 bg-secondary hidden md:block" />

        <div className="flex flex-col gap-4 text-center md:text-left">
          <h1 className="text-5xl font-label text-muted">TypeScript</h1>
          <h1 className="text-5xl font-pixel text-primary">Game Template</h1>
        </div>

        <button
          className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer"
          onClick={handleScollToContent}
        >
          <ChevronDown size={48} className="text-muted-light" />
        </button>
      </div>

      <div className="flex flex-col items-center gap-20 px-6 py-8" ref={homeContentRef}>
        <HomeSection
          isFlipped
          image="/logo.svg"
          title="Build Your Game"
          description={
            <>
              Create your game inside of <code>apps/electron</code> (Electron/React/Phaser client)
              and <code>apps/game-server</code> (Colyseus/Apollo server).
            </>
          }
        />
        <HomeSection
          image="/logo.svg"
          title="Adjust To Your Needs"
          description={
            <>
              Depending on your target platform (Mobile vs Web vs Desktop), you may want to consider
              hosting your game as a SPA (with PWA support), or React Native.
            </>
          }
        />
        <HomeSection
          isFlipped
          image="/logo.svg"
          title="Publish It Yourself"
          description={
            <>
              Publish your game yourself! Allow users to download straight from your website. You
              can also easily distribute via Steam, itch.io, etc.
            </>
          }
        />
      </div>
    </div>
  );
};

interface HomeSectionProps {
  image: string;
  title: string;
  description: React.ReactNode;
  isFlipped?: boolean;
}

const HomeSection = ({ image, title, description, isFlipped }: HomeSectionProps) => {
  return (
    <div
      className={cn(
        'flex flex-col md:flex-row items-center gap-20 max-w-4xl',
        isFlipped && 'md:flex-row-reverse'
      )}
    >
      <img
        src={image}
        alt={title}
        className="w-50 h-50 md:w-75 md:h-75 lg:w-100 lg:h-100 hover:animate-spin"
      />

      <div className="flex flex-col gap-6">
        <h2
          className={cn(
            'text-3xl lg:text-4xl font-title text-center md:text-left',
            isFlipped && 'md:text-right'
          )}
        >
          {title}
        </h2>
        <p
          className={cn(
            'max-w-sm lg:max-w-md text-lg text-muted text-center md:text-left',
            isFlipped && 'md:text-right'
          )}
        >
          {description}
        </p>
      </div>
    </div>
  );
};
