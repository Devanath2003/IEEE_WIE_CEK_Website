const Footer = () => {
  return (
    <footer className="bg-surface border-t border-glass-border py-8">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">I</span>
            </div>
            <span className="font-nav font-semibold text-foreground">
              IEEE SB CEK
            </span>
          </div>
          
          <div className="text-center md:text-right">
            <p className="font-body text-muted-foreground text-sm">
              © 2024 IEEE Student Branch CEK. All rights reserved.
            </p>
            <p className="font-body text-muted-foreground text-xs mt-1">
              Advancing Technology for Humanity
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;