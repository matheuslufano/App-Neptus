import Image from "next/image";
import Link from "next/link";

import NavBar from "./NavBar";
import packageJson from "../../../package.json";

const Header = () => {
  return (
    <header className="flex w-full items-center justify-between px-5 py-5 shadow-[0_2px_5px_0_rgba(0,0,0,0.1)] border-b flex-shrink-0">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Image
            src="/images/neptus-azul.svg"
            alt="Logo Neptus"
            className="w-[130px] h-auto"
            width="0"
            height="0"
            priority
          />
        </Link>
        <span className="text-sm text-slate-500">
          Versão {packageJson.version}
        </span>
      </div>

      <NavBar />
    </header>
  );
};
export default Header;
