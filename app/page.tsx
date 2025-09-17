import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// import { Search } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <div className="relative h-[500px] w-full overflow-hidden">
        <Image
          src="/images/mca-dept-fron2.jpg"
          alt="Hero background"
          width={1000}
          height={500}
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center p-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 text-center">
            Discover Amazing Content
          </h1>
          <div className="w-full max-w-md flex">
            <Input
              type="search"
              placeholder="Search..."
              className="flex-grow rounded-r-none text-black"
            />
            <Button type="submit" className="rounded-l-none">
              {/* <Search className="h-4 w-4 mr-2" /> */}
              Search
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
