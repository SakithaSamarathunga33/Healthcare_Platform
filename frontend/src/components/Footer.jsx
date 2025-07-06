import { HeartIcon } from '@heroicons/react/24/outline';

export default function Footer() {
  return (
    <footer className="bg-gray-800">
      <div className="w-full py-12 px-4 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="grid grid-cols-2 gap-8 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                  For Patients
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <a href="/patient/symptoms" className="text-base text-gray-300 hover:text-white">
                      Symptom Analysis
                    </a>
                  </li>
                  <li>
                    <a href="/patient/doctors" className="text-base text-gray-300 hover:text-white">
                      Find Doctors
                    </a>
                  </li>
                  <li>
                    <a href="/patient/history" className="text-base text-gray-300 hover:text-white">
                      Medical History
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                  For Doctors
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <a href="/doctor/dashboard" className="text-base text-gray-300 hover:text-white">
                      Doctor Portal
                    </a>
                  </li>
                  <li>
                    <a href="/register" className="text-base text-gray-300 hover:text-white">
                      Join as Doctor
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                  Support
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <a href="#" className="text-base text-gray-300 hover:text-white">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-base text-gray-300 hover:text-white">
                      Contact Us
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-base text-gray-300 hover:text-white">
                      FAQ
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                  Legal
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <a href="#" className="text-base text-gray-300 hover:text-white">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-base text-gray-300 hover:text-white">
                      Terms of Service
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 xl:mt-0">
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Medical Appointment System
            </h3>
            <p className="mt-4 text-base text-gray-300">
              AI-powered healthcare platform connecting patients with qualified doctors for better health outcomes.
            </p>
            <div className="flex items-center mt-4">
              <HeartIcon className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-sm text-gray-300">Making healthcare accessible for everyone</span>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8">
          <p className="text-base text-gray-400 xl:text-center">
            &copy; 2024 Medical Appointment System. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 