import { PhoneIcon } from "@heroicons/react/24/solid";
import { LetterCaseToggleIcon, LetterSpacingIcon } from "@radix-ui/react-icons";
import { MailIcon } from "lucide-react";

export function Footer() {
  return (
    <div className="bg-black py-16">
      <div className="container text-muted">
        <div className="grid grid-cols-4 gap-20">
          <div>
            <h4 className="text-3xl font-black mb-4">Barilo</h4>
            <p className="text-xs">Todos os direitos reservados.</p>
          </div>
          <div></div>
          <div></div>
          <div>
            <h4 className="text-lg font-black mb-4">Contato</h4>
            <ul className="text-background text-sm font-medium">
              <li className="flex items-center">
                <PhoneIcon className="w-4 mr-2" />
                <a href="tel:1234567890">(24) 98176-2288</a>
              </li>
              <li className="flex items-center">
                <MailIcon className="w-4 mr-2" />
                <a href="tel:1234567890">pedro357bm@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
