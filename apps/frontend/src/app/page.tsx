'use client';

import { useEffect } from 'react';

export default function HomePage() {
  useEffect(() => {
    const ships = [
      'Duke of Kent',
      'L\'Ocean',
      'Santa Ana',
      'Santisima Trinidad',
      'Victory',
      'Christian',
      'Le Bucentaure',
      'San Pedro',
      'St. Pavel',
      'Admiral de Ruyter',
      'Implacable',
      'Redoubtable',
      'Constitution',
      'Wapen von Hamburg',
      'Indefatigable'
    ];

    let currentShipIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    const typewriterElement = document.getElementById('typewriter-ship');

    const typeWriter = () => {
      if (!typewriterElement) return;

      const currentShip = ships[currentShipIndex];

      if (isDeleting) {
        typewriterElement.textContent = currentShip.substring(0, currentCharIndex - 1);
        currentCharIndex--;

        if (currentCharIndex === 0) {
          isDeleting = false;
          currentShipIndex = (currentShipIndex + 1) % ships.length;
          setTimeout(typeWriter, 500);
          return;
        }
      } else {
        typewriterElement.textContent = currentShip.substring(0, currentCharIndex + 1);
        currentCharIndex++;

        if (currentCharIndex === currentShip.length) {
          isDeleting = true;
          setTimeout(typeWriter, 2000);
          return;
        }
      }

      setTimeout(typeWriter, isDeleting ? 50 : 100);
    };

    setTimeout(typeWriter, 1000);
  }, []);

  return (
    <main className="relative">
      {/* Hero Section with Historical Naval Image Background */}
      <section className="relative h-screen">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/John_Cleveley_the_Elder%2C_The_Royal_George_at_Deptford_Showing_the_Launch_of_The_Cambridge_%281757%29.jpg/1200px-John_Cleveley_the_Elder%2C_The_Royal_George_at_Deptford_Showing_the_Launch_of_The_Cambridge_%281757%29.jpg)'
          }}
        />

        {/* Hero Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-dark/80 via-navy-dark/60 to-navy-dark/90"></div>

        {/* Hero Content */}
        <div className="relative z-10 flex items-center justify-center h-full pt-16">
          <div className="text-center px-4 max-w-5xl mx-auto">
            {/* Kraken Logo */}
            <div className="mb-8 flex justify-center">
              <img
                src="https://i.imgur.com/VwfpogC.png"
                alt="Kraken Logo"
                className="logo-floating w-32 h-32 md:w-48 md:h-48 object-contain drop-shadow-2xl"
              />
            </div>

            <h1 className="hero-title-brutal text-5xl md:text-8xl mb-6">
              <span className="text-brass-bright">Kraken</span>
            </h1>
            <div className="hero-subtitle text-xl md:text-3xl mb-12 max-w-3xl mx-auto"
               style={{
                 color: 'var(--sail-white)',
                 textShadow: '2px 2px 4px rgba(0,0,0,0.7), 0 0 10px rgba(184, 134, 11, 0.3)'
               }}>
              <p>
                Set sail with us in your <span id="typewriter-ship" className="text-brass-bright font-bold"></span>
              </p>
            </div>
          </div>
        </div>
      </section>      {/* Content section with naval theme */}
      <section className="py-24 bg-sandstone-light relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-5xl md:text-6xl font-bold text-navy-dark mb-12" style={{fontFamily: 'Cinzel, serif'}}>
              Welcome Aboard, <span className="text-brass">Captain</span>
            </h2>

            <div className="neo-brutal-box max-w-4xl mx-auto p-8 mb-16">
              <p className="text-xl md:text-2xl text-navy-dark leading-relaxed">
                Set sail with Kraken and the British Admiralty in Naval Action.
                Command your fleet through treacherous waters and claim victory in the age of wooden ships and iron men.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tommy Templeman's Welcome Letter */}
      <section className="py-16 bg-sandstone-light relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="letter-container bg-sail-white border-4 border-navy-dark p-8 md:p-12 shadow-2xl transform rotate-1">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
                A Letter from the Admiralty
              </h3>
            </div>

            <div className="space-y-6 text-navy-dark" style={{fontFamily: 'Crimson Text, serif'}}>
              <p className="text-lg leading-relaxed">
                <span className="text-2xl font-bold float-left mr-2 leading-none" style={{fontFamily: 'Cinzel, serif'}}>G</span>
                reetings, Captain! I am Tommy Templeman, Vice Chairman of the Defence Council and Second Sea Lord of the British Admiralty in Naval Action.
              </p>

              <p className="text-lg leading-relaxed">
                It brings me great pleasure to welcome you aboard our distinguished fleet. Here at Kraken, we&apos;ve sailed through countless storms and emerged victorious time and again. Our brotherhood is built on honor, tactical excellence, and the unbreakable bonds forged in the heat of naval combat.
              </p>

              <p className="text-lg leading-relaxed">
                Whether you&apos;re a seasoned captain or a fresh midshipman eager to learn the ropes, you&apos;ll find your place among our ranks. We offer comprehensive training, strategic guidance, and the camaraderie that only comes from shared victories on the high seas.
              </p>

              <p className="text-lg leading-relaxed mb-12">
                Set your course for adventure, and may fair winds fill your sails as you join the legendary Kraken fleet!
              </p>

              <div className="text-right">
                <p className="text-xl italic mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                  With deepest respect and fair winds,
                </p>
                <div className="signature-line">
                  <img
                    src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMjAwIDUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xMCAzMEM0MCAyMCA3MCAzNSA5MCAyNUMxMTAgMTUgMTMwIDI1IDE1MCAyMEMxNzAgMTUgMTkwIDI1IDE5MCAyNSIgc3Ryb2tlPSIjMTk0MTY4IiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiLz48L3N2Zz4="
                    alt="Signature"
                    className="w-48 h-12 mx-auto"
                  />
                  <p className="text-lg font-bold mt-2" style={{fontFamily: 'Cinzel, serif'}}>
                    Tommy Templeman
                  </p>
                  <p className="text-sm text-brass">
                    Vice Chairman of the Defence Council<br/>
                    Second Sea Lord, British Admiralty
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Naval Action Benefits Section */}
      <section className="py-24 bg-sandstone-light relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-navy-dark mb-8" style={{fontFamily: 'Cinzel, serif'}}>
              Why Sail with <span className="text-brass">Kraken</span>?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="neo-brutal-box p-6 text-center">
              <h3 className="text-xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
                Veteran Leadership
              </h3>
              <p className="text-navy-dark leading-relaxed">
                Veteran RvR and Port Battle Commanders with years of experience leading fleets to victory
              </p>
            </div>

            <div className="neo-brutal-box p-6 text-center">
              <h3 className="text-xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
                Superior Shipbuilding
              </h3>
              <p className="text-navy-dark leading-relaxed">
                A dedicated shipbuilding program that helps Captains set sail in the best ships available
              </p>
            </div>

            <div className="neo-brutal-box p-6 text-center">
              <h3 className="text-xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
                Crafting Benefits
              </h3>
              <p className="text-navy-dark leading-relaxed">
                A members-only crafting program with steep discounts to keep our Captains in the fight with all the cannons, munitions, and consumables they need
              </p>
            </div>

            <div className="neo-brutal-box p-6 text-center">
              <h3 className="text-xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
                Daily Combat
              </h3>
              <p className="text-navy-dark leading-relaxed">
                Daily PvP, Ganking, and RvR Port Battles to keep your skills sharp and your coffers full
              </p>
            </div>

            <div className="neo-brutal-box p-6 text-center">
              <h3 className="text-xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
                Regular Events
              </h3>
              <p className="text-navy-dark leading-relaxed">
                Weekly and Daily events run by seasoned Officers and Captains within Kraken
              </p>
            </div>

            <div className="neo-brutal-box p-6 text-center">
              <h3 className="text-xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
                British Connection
              </h3>
              <p className="text-navy-dark leading-relaxed">
                A deep connection to the British Nation and British Admiralty, we run content with them daily
              </p>
            </div>

            <div className="neo-brutal-box p-6 text-center md:col-span-2 lg:col-span-3">
              <h3 className="text-xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
                Training & Knowledge
              </h3>
              <p className="text-navy-dark leading-relaxed">
                An extensive library of training manuals and video tutorials for new and veteran Captains alike
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Kraken Naval Command Section */}
      <section className="py-24 bg-sandstone-light relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-navy-dark mb-8" style={{fontFamily: 'Cinzel, serif'}}>
              Kraken <span className="text-brass-bright">Naval Command</span>
            </h2>
            <p className="text-xl text-navy-dark/80 max-w-3xl mx-auto">
              The highest echelons of naval command, leading our fleet through strategic waters
            </p>
          </div>

          {/* Defense Council */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-brass-bright mb-8 text-center" style={{fontFamily: 'Cinzel, serif'}}>
              Defense Council
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="officer-card bg-sandstone-light border-4 border-brass relative">
                <div className="absolute top-2 right-2">
                  <img src="https://flagcdn.com/24x18/us.png" alt="US Flag" className="w-6 h-4" />
                </div>
                <div className="flex">
                  <div className="w-20 h-20 bg-gray-300 border-2 border-brass mr-4 flex-shrink-0">
                    {/* Profile picture placeholder */}
                    <div className="w-full h-full bg-gray-400 flex items-center justify-center text-xs text-gray-600">
                      Photo
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>CHOSEN</h4>
                    <p className="text-sm text-navy-dark font-medium">Chairman of the Defence Council and First Sea Lord</p>
                    <p className="text-xs text-brass italic">(Clan Founder)</p>
                  </div>
                </div>
              </div>

              <div className="officer-card tommy-card bg-sandstone-light relative">
                <div className="absolute top-2 right-2 z-50">
                  <img src="https://flagcdn.com/24x18/us.png" alt="US Flag" className="w-6 h-4" />
                </div>
                <div className="flex">
                  <div className="w-20 h-20 bg-gray-300 border-2 border-brass mr-4 flex-shrink-0">
                    <div className="w-full h-full bg-gray-400 flex items-center justify-center text-xs text-gray-600">
                      Photo
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>Tommy Templeman</h4>
                    <p className="text-sm text-navy-dark font-medium">Vice Chairman of the Defence Council and Second Sea Lord</p>
                    <p className="text-xs text-brass italic">(Clan Leader)</p>
                  </div>
                </div>
              </div>

              <div className="officer-card bg-sandstone-light border-4 border-brass relative">
                <div className="absolute top-2 right-2">
                  <img src="https://flagcdn.com/24x18/us.png" alt="US Flag" className="w-6 h-4" />
                </div>
                <div className="flex">
                  <div className="w-20 h-20 bg-gray-300 border-2 border-brass mr-4 flex-shrink-0">
                    <div className="w-full h-full bg-gray-400 flex items-center justify-center text-xs text-gray-600">
                      Photo
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>ODDBALL</h4>
                    <p className="text-sm text-navy-dark font-medium">Vice Chairman of the Defence Council - Admiralty Board and Third Sea Lord</p>
                    <p className="text-xs text-brass italic">(Clan Leader)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Admiralty Board */}
          <div>
            <h3 className="text-3xl font-bold text-brass-bright mb-8 text-center" style={{fontFamily: 'Cinzel, serif'}}>
              Admiralty Board
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="officer-card bg-sandstone-light border-4 border-brass relative">
                <div className="absolute top-2 right-2">
                  <img src="https://flagcdn.com/24x18/us.png" alt="US Flag" className="w-6 h-4" />
                </div>
                <div className="flex">
                  <div className="w-20 h-20 bg-gray-300 border-2 border-brass mr-4 flex-shrink-0">
                    <div className="w-full h-full bg-gray-400 flex items-center justify-center text-xs text-gray-600">
                      Photo
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>Tommy Templeman</h4>
                    <p className="text-sm text-navy-dark font-medium">Admiral of the Fleet</p>
                    <p className="text-xs text-brass italic">(Clan Leader)</p>
                  </div>
                </div>
              </div>

              <div className="officer-card bg-sandstone-light border-4 border-brass relative">
                <div className="absolute top-2 right-2">
                  <img src="https://flagcdn.com/24x18/us.png" alt="US Flag" className="w-6 h-4" />
                </div>
                <div className="flex">
                  <div className="w-20 h-20 bg-gray-300 border-2 border-brass mr-4 flex-shrink-0">
                    <div className="w-full h-full bg-gray-400 flex items-center justify-center text-xs text-gray-600">
                      Photo
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>ODDBALL</h4>
                    <p className="text-sm text-navy-dark font-medium">Admiral - Home Fleet</p>
                    <p className="text-xs text-brass italic">(Clan Leader)</p>
                  </div>
                </div>
              </div>

              <div className="officer-card bg-sandstone-light border-4 border-brass relative">
                <div className="absolute top-2 right-2">
                  <img src="https://flagcdn.com/24x18/us.png" alt="US Flag" className="w-6 h-4" />
                </div>
                <div className="flex">
                  <div className="w-20 h-20 bg-gray-300 border-2 border-brass mr-4 flex-shrink-0">
                    <div className="w-full h-full bg-gray-400 flex items-center justify-center text-xs text-gray-600">
                      Photo
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>Yawnek</h4>
                    <p className="text-sm text-navy-dark font-medium">Vice Admiral - Home Fleet</p>
                    <p className="text-xs text-brass italic">(Clan 1st Officer)</p>
                  </div>
                </div>
              </div>

              <div className="officer-card bg-sandstone-light border-4 border-brass relative">
                <div className="absolute top-2 right-2">
                  <img src="https://flagcdn.com/24x18/us.png" alt="US Flag" className="w-6 h-4" />
                </div>
                <div className="flex">
                  <div className="w-20 h-20 bg-gray-300 border-2 border-brass mr-4 flex-shrink-0">
                    <div className="w-full h-full bg-gray-400 flex items-center justify-center text-xs text-gray-600">
                      Photo
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>William Poe</h4>
                    <p className="text-sm text-navy-dark font-medium">Admiral and Chairman of the Victualling Board</p>
                    <p className="text-xs text-brass italic">(Clan 1st Officer)</p>
                  </div>
                </div>
              </div>

              <div className="officer-card bg-sandstone-light border-4 border-brass relative">
                <div className="absolute top-2 right-2">
                  <img src="https://flagcdn.com/24x18/us.png" alt="US Flag" className="w-6 h-4" />
                </div>
                <div className="flex">
                  <div className="w-20 h-20 bg-gray-300 border-2 border-brass mr-4 flex-shrink-0">
                    <div className="w-full h-full bg-gray-400 flex items-center justify-center text-xs text-gray-600">
                      Photo
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>Ash1586</h4>
                    <p className="text-sm text-navy-dark font-medium">Rear Admiral - Home Fleet</p>
                  </div>
                </div>
              </div>

              <div className="officer-card bg-sandstone-light border-4 border-brass relative">
                <div className="absolute top-2 right-2">
                  <img src="https://flagcdn.com/24x18/us.png" alt="US Flag" className="w-6 h-4" />
                </div>
                <div className="flex">
                  <div className="w-20 h-20 bg-gray-300 border-2 border-brass mr-4 flex-shrink-0">
                    <div className="w-full h-full bg-gray-400 flex items-center justify-center text-xs text-gray-600">
                      Photo
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>Consang</h4>
                    <p className="text-sm text-navy-dark font-medium">Rear Admiral - Home Fleet</p>
                  </div>
                </div>
              </div>

              <div className="officer-card bg-sandstone-light border-4 border-brass relative">
                <div className="absolute top-2 right-2">
                  <img src="https://flagcdn.com/24x18/us.png" alt="US Flag" className="w-6 h-4" />
                </div>
                <div className="flex">
                  <div className="w-20 h-20 bg-gray-300 border-2 border-brass mr-4 flex-shrink-0">
                    <div className="w-full h-full bg-gray-400 flex items-center justify-center text-xs text-gray-600">
                      Photo
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>Cpt Nelson</h4>
                    <p className="text-sm text-navy-dark font-medium">Rear Admiral - Home Fleet</p>
                  </div>
                </div>
              </div>

              <div className="officer-card bg-sandstone-light border-4 border-brass relative">
                <div className="absolute top-2 right-2">
                  <img src="https://flagcdn.com/24x18/us.png" alt="US Flag" className="w-6 h-4" />
                </div>
                <div className="flex">
                  <div className="w-20 h-20 bg-gray-300 border-2 border-brass mr-4 flex-shrink-0">
                    <div className="w-full h-full bg-gray-400 flex items-center justify-center text-xs text-gray-600">
                      Photo
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>Honey Badger</h4>
                    <p className="text-sm text-navy-dark font-medium">Rear Admiral - Naval Attache to the People of the United States</p>
                  </div>
                </div>
              </div>

              <div className="officer-card bg-sandstone-light border-4 border-brass relative">
                <div className="absolute top-2 right-2">
                  <img src="https://flagcdn.com/24x18/us.png" alt="US Flag" className="w-6 h-4" />
                </div>
                <div className="flex">
                  <div className="w-20 h-20 bg-gray-300 border-2 border-brass mr-4 flex-shrink-0">
                    <div className="w-full h-full bg-gray-400 flex items-center justify-center text-xs text-gray-600">
                      Photo
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>Henry Henryson</h4>
                    <p className="text-sm text-navy-dark font-medium">Rear Admiral - Caribbean Fleet</p>
                  </div>
                </div>
              </div>

              <div className="officer-card bg-sandstone-light border-4 border-brass relative">
                <div className="absolute top-2 right-2">
                  <img src="https://flagcdn.com/24x18/us.png" alt="US Flag" className="w-6 h-4" />
                </div>
                <div className="flex">
                  <div className="w-20 h-20 bg-gray-300 border-2 border-brass mr-4 flex-shrink-0">
                    <div className="w-full h-full bg-gray-400 flex items-center justify-center text-xs text-gray-600">
                      Photo
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>JustHarry</h4>
                    <p className="text-sm text-navy-dark font-medium">Rear Admiral - Far East Fleet</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
