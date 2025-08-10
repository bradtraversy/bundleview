interface HeaderProps {
  onReset?: () => void;
}

const Header = ({ onReset }: HeaderProps) => {
  return (
    <header className='bg-dark-card border-b border-gray-800'>
      <div className='container mx-auto px-4 py-6'>
        <div className='flex items-center justify-between'>
          <div
            className='flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity duration-200'
            onClick={onReset}
          >
            <div className='w-10 h-10 bg-accent rounded-lg flex items-center justify-center'>
              <svg
                className='w-6 h-6 text-dark-bg'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                />
              </svg>
            </div>
            <div>
              <h1 className='text-2xl font-bold text-white'>BundleView</h1>
              <p className='text-gray-400 text-sm'>
                View and optimize your JS bundles
              </p>
            </div>
          </div>

          <nav className='hidden md:flex items-center space-x-6'>
            <a
              href='https://github.com/bradtraversy/bundleview'
              target='_blank'
              rel='noopener noreferrer'
              className='text-gray-400 hover:text-accent transition-colors duration-200'
              aria-label='View on GitHub'
            >
              <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' />
              </svg>
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
