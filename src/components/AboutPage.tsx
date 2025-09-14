import { useState, useEffect } from "react";

export function AboutPage() {
	const [activeSection, setActiveSection] = useState('');
  const [showFloatingNav, setShowFloatingNav] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    // Initial check if floating window should render
    setShowFloatingNav(windowWidth >= 720);

    // Track scroll position for floating navigation
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = documentHeight > 0 ? (scrollPosition / documentHeight) * 100 : 0;
      
      setScrollProgress(Math.min(100, progress));
    };

    const handleResize = () => {
      const newWidth = window.innerWidth;
      setWindowWidth(newWidth);
      // Hide floating nav if screen becomes too small
      if (newWidth < 720) {
        setShowFloatingNav(false);
      } else {
        setShowFloatingNav(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    // Initial check
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [windowWidth]);

  // Smooth scroll function with accessibility support
  const scrollToSection = (sectionId: string, event?: React.MouseEvent | React.KeyboardEvent) => {
    if (event) {
      event.preventDefault();
    }
    
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      // Update active section
      setActiveSection(sectionId);

      // Focus the target element for screen readers
      setTimeout(() => {
        element.focus();
        // Announce to screen readers that the section has been reached
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = `Navigated to ${element.querySelector('h2')?.textContent || sectionId} section`;
        document.body.appendChild(announcement);
        setTimeout(() => document.body.removeChild(announcement), 1000);
      }, 500);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, sectionId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      scrollToSection(sectionId, event);
    }
  };

  // Intersection Observer to track active section
  useEffect(() => {
    const sections = ['about', 'skills', 'education', 'experience', 'certifications'];
    const observers: IntersectionObserver[] = [];

    sections.forEach(sectionId => {
      const element = document.getElementById(sectionId);
      if (element) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setActiveSection(sectionId);
            }
          },
          {
            rootMargin: '-100px 0px -50% 0px', // Trigger when section is well into view
            threshold: 0.1
          }
        );
        observer.observe(element);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, []);

	// Navigation link component for floating modal
  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const sectionId = href.replace('#', '');
    const isActive = activeSection === sectionId;
    
    return (
      <button
        onClick={(e) => scrollToSection(sectionId, e)}
        onKeyDown={(e) => handleKeyDown(e, sectionId)}
        className={`text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 relative focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded-lg px-3 py-2 text-left w-full flex items-center justify-between group ${
          isActive ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
        }`}
        aria-label={`Navigate to ${children} section`}
        role="button"
        tabIndex={0}
      >
        <span>{children}</span>
        {isActive && (
          <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full" aria-hidden="true" />
        )}
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    );
  };
	
	return (
    <div className="max-w-4xl mx-auto px-4 py-12">
			{/* Floating Modal Navigation */}
		<div 
		  className={`fixed z-40 transition-all duration-500 ease-out ${
				showFloatingNav 
					? 'opacity-100 translate-y-0 scale-100' 
					: 'opacity-0 translate-y-8 scale-95 pointer-events-none'
			}`}
			style={{
				top: '25%',
				right: '2rem',
				transform: 'translateY(-50%)'
			}}
		>
			<div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/30 dark:border-gray-700/30 p-1 min-w-[220px] max-w-[280px]">
				{/* Modal Header */}
				<div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Quick Navigation</h3>
						<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Active"></div>
					</div>
				</div>
				
				{/* Navigation Links */}
				<div className="p-2">
					<div className="flex flex-col space-y-1">
						<NavLink href="#about">About</NavLink>
						<NavLink href="#skills">Skills</NavLink>
						<NavLink href="#education">Education</NavLink>
						<NavLink href="#experience">Experience</NavLink>
						<NavLink href="#certifications">Certifications</NavLink>
					</div>
				</div>
				
				{/* Scroll Progress Indicator */}
				<div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700">
					<div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
						<span>Scroll Progress</span>
						<div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
							<div 
								className="h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 transition-all duration-300 ease-out"
								style={{
									width: `${scrollProgress}%`
								}}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
			
			{/* About */}
      <div className="bg-white dark:bg-card-dark rounded-lg shadow-sm border border-gray-200 dark:border-card-border-dark p-8">
				
        {/* Hero Section */}
	      <section className="pt-24 pb-16 px-4">
	        <div className="max-w-6xl mx-auto text-center">
	          <h1 className="text-5xl md:text-6xl font-bold text-slate-800 dark:text-slate-100 mb-4">
	            Joshua Jay Runyan
	          </h1>
	          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-8">
	            Software Engineer
	          </p>
	          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
	            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
	              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
	                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
	              </svg>
	              Yakima, WA, USA
	            </div>
	            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
	              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
	                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
	              </svg>
	              (219) 689-1556
	            </div>
	            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
	              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
	                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
	                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
	              </svg>
	              runyan@ashtacore.com
	            </div>
	          </div>
	          <div className="flex gap-4 justify-center">
	            <a href="https://www.linkedin.com/in/joshua-jay-runyan/" target="_blank" rel="noopener noreferrer" 
	               className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center gap-2">
	              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
	                <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
	              </svg>
	              LinkedIn
	            </a>
	            <a href="https://github.com/ashtacore" target="_blank" rel="noopener noreferrer"
	               className="bg-slate-800 dark:bg-slate-700 text-white px-6 py-3 rounded-lg hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors flex items-center gap-2">
	              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
	                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
	              </svg>
	              GitHub
	            </a>
	          </div>
	        </div>
	      </section>

	      {/* About Section */}
	      <section id="about" className="py-16 px-4 scroll-mt-20" tabIndex={-1} aria-labelledby="about-heading">
	        <div className="max-w-4xl mx-auto">
	          <h2 id="about-heading" className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-8 text-center">About Me</h2>
	          <div className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed text-center max-w-3xl mx-auto">
	            <p>
	              I am a software engineer with over 5 years of professional experience. My passion for 
	              learning has lead me to start pursuing a Bachelor of Science in Electrical Engineering
	              at Arizona State University. I believe my breadth of knowledge in software development, 
	              HVAC controlls, and data center design is what makes me valuable to the teams I work with.
	              This is why I am always striving to learn new things, like Electrical Engineering!
	            </p>
	            <p className="mt-4">
	              My experience spans from building enterprise-level applications and Revit add-ins to 
	              designing IoT monitoring systems and deploying analytics platforms across multiple sites. 
	              I thrive at the intersection of software and hardware, creating solutions that bridge 
	              the digital and physical worlds.
	            </p>
	          </div>
	        </div>
	      </section>

	      {/* Skills Section */}
	      <section id="skills" className="py-16 px-4 scroll-mt-20" tabIndex={-1} aria-labelledby="skills-heading">
	        <div className="max-w-6xl mx-auto">
	          <h2 id="skills-heading" className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-12 text-center">Skills</h2>
	          <div className="grid md:grid-cols-2 gap-8">
	            <div>
	              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">Languages</h3>
	              <div className="flex flex-wrap gap-2">
	                {['C#', 'Go', 'JavaScript', 'Python', 'PowerShell', 'Java', 'R'].map((skill) => (
	                  <span key={skill} className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
	                    {skill}
	                  </span>
	                ))}
	              </div>
	            </div>
	            <div>
	              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">Frameworks & Tools</h3>
	              <div className="flex flex-wrap gap-2">
	                {['.NET Framework/Core', 'Blazor', 'WPF', 'Charm', 'Vue.js', 'Flask', 'SQL Server', 'PostgreSQL', 'AWS', 'Azure', 'Azure DevOps', 'Revit', 'Navisworks', 'Niagara Controls', 'Ignition'].map((skill) => (
	                  <span key={skill} className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium">
	                    {skill}
	                  </span>
	                ))}
	              </div>
	            </div>
	          </div>
	        </div>
	      </section>

	      {/* Education Section */}
	      <section id="education" className="py-16 px-4 scroll-mt-20" tabIndex={-1} aria-labelledby="education-heading">
	        <div className="max-w-4xl mx-auto">
	          <h2 id="education-heading" className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-12 text-center">Education</h2>
	          <div className="space-y-6">
	            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg">
	              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Bachelor of Science in Electrical Engineering</h3>
	              <p className="text-blue-600 dark:text-blue-400 font-medium">Arizona State University</p>
	              <p className="text-slate-600 dark:text-slate-400">Jan 2024 – Present</p>
	            </div>
	            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg">
	              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Bachelor of Applied Science in Energy Technology</h3>
	              <p className="text-blue-600 dark:text-blue-400 font-medium">Siena Heights University</p>
	              <p className="text-slate-600 dark:text-slate-400">Aug 2019 – Dec 2021</p>
	            </div>
	            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg">
	              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Associate of Applied Science in Energy Technology</h3>
	              <p className="text-blue-600 dark:text-blue-400 font-medium">MIAT College of Technology</p>
	              <p className="text-slate-600 dark:text-slate-400">Sep 2016 – Jan 2018</p>
	            </div>
	          </div>
	        </div>
	      </section>

	      {/* Experience Section */}
	      <section id="experience" className="py-16 px-4 scroll-mt-20" tabIndex={-1} aria-labelledby="experience-heading">
	        <div className="max-w-6xl mx-auto">
	          <h2 id="experience-heading" className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-12 text-center">Professional Experience</h2>
	          <div className="space-y-8">
	            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg shadow-sm">
	              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
	                <div>
	                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Software Engineer</h3>
	                  <p className="text-blue-600 dark:text-blue-400 font-medium">DLB Associates</p>
	                </div>
	                <div className="text-slate-600 dark:text-slate-400 mt-2 md:mt-0">
	                  <p>Aug 2022 – Present</p>
	                  <p>Yakima, WA, Remote</p>
	                </div>
	              </div>
	              <p className="text-slate-600 dark:text-slate-400">
	                Built C# Revit add-ins, Blazor web apps, mentored developers, maintained MS Office COM add-ins.
	              </p>
	            </div>

	            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg shadow-sm">
	              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
	                <div>
	                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Systems Integration Engineer</h3>
	                  <p className="text-blue-600 dark:text-blue-400 font-medium">Performance Services</p>
	                </div>
	                <div className="text-slate-600 dark:text-slate-400 mt-2 md:mt-0">
	                  <p>Feb 2022 – Aug 2022</p>
	                  <p>Remote</p>
	                </div>
	              </div>
	              <p className="text-slate-600 dark:text-slate-400">
	                Expanded PSI Analytics for Modbus data, deployed to 30 sites, built Arduino-based monitoring device.
	              </p>
	            </div>

	            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg shadow-sm">
	              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
	                <div>
	                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Sole Proprietor / Software Engineer</h3>
	                  <p className="text-blue-600 dark:text-blue-400 font-medium">HVA Contracting</p>
	                </div>
	                <div className="text-slate-600 dark:text-slate-400 mt-2 md:mt-0">
	                  <p>Aug 2021 – Jan 2022</p>
	                  <p>Remote</p>
	                </div>
	              </div>
	              <p className="text-slate-600 dark:text-slate-400">
	                Continued PSI Analytics development and deployments.
	              </p>
	            </div>

	            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg shadow-sm">
	              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
	                <div>
	                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Performance Analytics Engineer</h3>
	                  <p className="text-blue-600 dark:text-blue-400 font-medium">Performance Services</p>
	                </div>
	                <div className="text-slate-600 dark:text-slate-400 mt-2 md:mt-0">
	                  <p>Jun 2019 – Aug 2021</p>
	                  <p>Indianapolis, IN</p>
	                </div>
	              </div>
	              <p className="text-slate-600 dark:text-slate-400">
	                Designed/deployed PSI Analytics (Raspberry Pi, Python, TimescaleDB, Go Lambdas, Grafana dashboards), 40 sites deployed, co-built internal Vue.js web app.
	              </p>
	            </div>

	            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg shadow-sm">
	              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
	                <div>
	                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Computer Sales Supervisor</h3>
	                  <p className="text-blue-600 dark:text-blue-400 font-medium">Fry's Electronics</p>
	                </div>
	                <div className="text-slate-600 dark:text-slate-400 mt-2 md:mt-0">
	                  <p>Mar 2018 – Jun 2019</p>
	                  <p>Indianapolis, IN</p>
	                </div>
	              </div>
	              <p className="text-slate-600 dark:text-slate-400">
	                Managed 10-person team, scheduling, reviews, and customer satisfaction.
	              </p>
	            </div>

	            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg shadow-sm">
	              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
	                <div>
	                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">System Administrator</h3>
	                  <p className="text-blue-600 dark:text-blue-400 font-medium">American Inter-Fidelity Exchange</p>
	                </div>
	                <div className="text-slate-600 dark:text-slate-400 mt-2 md:mt-0">
	                  <p>Mar 2013 – Mar 2015</p>
	                  <p>Crown Point, IN</p>
	                </div>
	              </div>
	              <p className="text-slate-600 dark:text-slate-400">
	                Migrated IT infrastructure, implemented Active Directory, improved cybersecurity compliance.
	              </p>
	            </div>

	            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg shadow-sm">
	              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
	                <div>
	                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Sole Proprietor / IT Specialist</h3>
	                  <p className="text-blue-600 dark:text-blue-400 font-medium">Courtesy Computer Tech</p>
	                </div>
	                <div className="text-slate-600 dark:text-slate-400 mt-2 md:mt-0">
	                  <p>Mar 2012 – Mar 2018</p>
	                  <p>Crown Point, IN</p>
	                </div>
	              </div>
	              <p className="text-slate-600 dark:text-slate-400">
	                Computer repair, maintenance, WordPress websites.
	              </p>
	            </div>
	          </div>
	        </div>
	      </section>

	      {/* Certifications Section */}
	      <section id="certifications" className="py-16 px-4 scroll-mt-20" tabIndex={-1} aria-labelledby="certifications-heading">
	        <div className="max-w-6xl mx-auto">
	          <h2 id="certifications-heading" className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-12 text-center">Certifications</h2>
	          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
	            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
	              <div className="flex items-center mb-3">
	                <div className="w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full mr-3"></div>
	                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Azure Fundamentals</h3>
	              </div>
	              <p className="text-slate-600 dark:text-slate-400 text-sm">Microsoft</p>
	            </div>
	            
	            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
	              <div className="flex items-center mb-3">
	                <div className="w-3 h-3 bg-green-500 dark:bg-green-400 rounded-full mr-3"></div>
	                <h3 className="font-semibold text-slate-800 dark:text-slate-200">R Programming</h3>
	              </div>
	              <p className="text-slate-600 dark:text-slate-400 text-sm">Johns Hopkins University</p>
	            </div>
	            
	            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
	              <div className="flex items-center mb-3">
	                <div className="w-3 h-3 bg-purple-500 dark:bg-purple-400 rounded-full mr-3"></div>
	                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Object-Oriented Programming in Java</h3>
	              </div>
	              <p className="text-slate-600 dark:text-slate-400 text-sm">UC San Diego</p>
	            </div>
	            
	            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 rounded-lg border border-orange-200 dark:border-orange-800">
	              <div className="flex items-center mb-3">
	                <div className="w-3 h-3 bg-orange-500 dark:bg-orange-400 rounded-full mr-3"></div>
	                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Niagara 4 Technical Certification Level 2</h3>
	              </div>
	              <p className="text-slate-600 dark:text-slate-400 text-sm">Tridium</p>
	            </div>
	            
	            <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 p-6 rounded-lg border border-teal-200 dark:border-teal-800">
	              <div className="flex items-center mb-3">
	                <div className="w-3 h-3 bg-teal-500 dark:bg-teal-400 rounded-full mr-3"></div>
	                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Niagara 4 Developer Certification</h3>
	              </div>
	              <p className="text-slate-600 dark:text-slate-400 text-sm">Tridium</p>
	            </div>
	            
	            <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
	              <div className="flex items-center mb-3">
	                <div className="w-3 h-3 bg-red-500 dark:bg-red-400 rounded-full mr-3"></div>
	                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Alerton Certified Engineer</h3>
	              </div>
	              <p className="text-slate-600 dark:text-slate-400 text-sm">Alerton</p>
	            </div>
	          </div>
	        </div>
	      </section>
      </div>
    </div>
  );
}
