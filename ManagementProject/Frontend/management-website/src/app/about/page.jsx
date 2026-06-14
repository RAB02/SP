export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="text-6xl font-bold text-blue-900 mb-6">About Us</h1>

        <p className="text-lg leading-relaxed mb-8">
          Welcome to our apartment management platform. Our goal is to simplify
          the process of finding quality housing while connecting residents with
          comfortable and well-maintained living spaces.
        </p>

        <h2 className="text-4xl font-semibold text-blue-800 mb-3">
          Our Mission
        </h2>
        <p className="text-base mb-8">
          Our mission is to provide residents with reliable housing options and
          a seamless rental experience. We strive to create welcoming living
          environments by offering thoughtfully selected properties in desirable
          locations, ensuring comfort, convenience, and community for every
          resident.
        </p>

        <h2 className="text-4xl font-semibold text-blue-800 mb-3">
          What We Offer
        </h2>
        <ul className="list-disc list-inside mb-8 space-y-2">
          <li>Spacious studio, one-, two-, and three-bedroom apartments and homes</li>
          <li>Properties located near schools, dining, shopping, and entertainment</li>
          <li>Pet-friendly communities with accessible outdoor spaces</li>
        </ul>

        <h2 className="text-4xl font-semibold text-blue-800 mb-3">
          Why Choose Us
        </h2>
        <p className="text-base mb-8">
          Whether you're a student, working professional, or part of a growing
          family, our platform helps you discover housing options that balance
          comfort, accessibility, and quality. We aim to make the apartment
          search process straightforward and dependable while helping residents
          find a place they are proud to call home.
        </p>

        <h2 className="text-4xl font-semibold text-blue-800 mb-6">
          Meet The Team
        </h2>

        {/* TEAM MEMBER 1 */}
        <div className="mt-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Ramon Bernal
              </h3>
              <p className="mt-0.5 text-sm text-gray-700">Project Lead & Full-Stack Developer</p>
            </div>

            {/* LinkedIn Button */}
            <a
              href="https://www.linkedin.com/in/ramon-bernal-286669309/"
              target="_blank"
              rel="noreferrer"
              className="text-[#0072b1] transition-opacity hover:opacity-90"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="size-7">
                <path
                  d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"
                  clipRule="evenodd"
                  fillRule="evenodd"
                />
              </svg>
            </a>
          </div>

          <p className="mt-2 text-gray-700">
            Led the development of the project and coordinated team tasks. Responsible for both frontend and backend implementation, integrating system components, and ensuring the overall functionality and architecture of the application.
          </p>
        </div>        
      </div>
    </div>
  );
}
