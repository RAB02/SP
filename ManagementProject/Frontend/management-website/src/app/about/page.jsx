

export default function About(){
  return(
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="text-6xl font-bold text-blue-900 mb-6">About Us</h1>
        <p className="text-lg leading-relaxed mb-8">Welcome to 
          <span className="font-semibold">The **** Apartments</span>, where modern design meets everyday comfort. Located in the heart of Edinburg Texas</p>
        <h2 className="text-4xl font-semibold text-blue-800 mb-3">Our Mission</h2>
        <p className="text-base mb-8">
          Our mission is to create a welcoming and inclusive environment where residents can thrive. From thoughtfully designed spaces to community events, we strive to make The Arlo not just a place to live—but a place to call home.
        </p>
        <h2 className="text-4xl font-semibold text-blue-800 mb-3">What We Offer</h2>
          <ul className="list-disc list-inside mb-8 space-y-2">
            <li>Spacious studio, one-, two-, and three-bedroom apartments</li>
            <li>Modern amenities including a fitness center, pool, </li>
            <li>Pet-friendly environment with outdoor walking spaces</li>
            <li>Secure parking and smart home technology</li>
          </ul>
        <h2 className="text-4xl font-semibold text-blue-800 mb-3">Why Choose Us</h2>
        <p className="text-base mb-8">
          Whether you’re a student, professional, or growing family, The Arlo Apartments provide the perfect balance of comfort, style, and convenience. Experience vibrant city living with a community that feels like home.
        </p>
        <h2 className="text-4xl font-semibold text-blue-800 mb-3">Meet The Team</h2>
        <h3 className="text-2xl font-semibold text-black-800 mb-3">Ramon Bernal</h3>
        <h3 className="text-2xl font-semibold text-black-800 mb-3">Dante Peraza</h3>
        <h3 className="text-2xl font-semibold text-black-800 mb-3">Steven Valdez</h3>
        <h3 className="text-2xl font-semibold text-black-800 mb-3">Ian Barrera</h3>
        <div className="mt-10">
          <a href="/contact" className="inline-block bg-blue-900 text-white font-medium px-6 py-3 rounded-lg hover:bg-blue-800 transition">
            Schedule a Tour
          </a>
        </div>
      </div>
    </div>
  )
}