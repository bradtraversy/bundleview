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
              <h1 className='text-2xl font-bold text-white'>
                Bundle Size Analyzer
              </h1>
              <p className='text-gray-400 text-sm'>
                Optimize your JavaScript bundles
              </p>
            </div>
          </div>

          <nav className='hidden md:flex items-center space-x-6'>
            <a
              href='https://github.com'
              target='_blank'
              rel='noopener noreferrer'
              className='text-gray-400 hover:text-accent transition-colors duration-200'
            >
              GitHub
            </a>
            <a
              href='https://docs.example.com'
              target='_blank'
              rel='noopener noreferrer'
              className='text-gray-400 hover:text-accent transition-colors duration-200'
            >
              Docs
            </a>
            <button className='btn-primary'>Get Started</button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
