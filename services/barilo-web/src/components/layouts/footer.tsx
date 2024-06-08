import { PhoneIcon } from "@heroicons/react/24/solid";
import { LetterCaseToggleIcon, LetterSpacingIcon } from "@radix-ui/react-icons";
import { MailIcon } from "lucide-react";

export function Footer() {
  return (
    <div className="bg-black py-16">
      <div className="container text-white">
        <div className="grid grid-cols-4">
          <div>
            <h4 className="text-lg font-bold mb-4">Contato</h4>
            <ul className="text-background">
              <li className="flex items-center">
                <PhoneIcon className="w-4 mr-2" />
                <a href="tel:1234567890">(24) 98176-2288</a>
              </li>
              <li className="flex items-center">
                <MailIcon className="w-4 mr-2" />
                <a href="tel:1234567890">barilo@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
