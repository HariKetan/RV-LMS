import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AllTeachersTable from "./components/AllTeachersTable";
import FacultyRegistrationForm from "./components/FacultyRegistrationForm";

export default function FacultiesTab() {
  return (
    <Tabs defaultValue="all-teachers-table" className="w-3/4 mx-auto pt-10">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="all-teachers-table">Manage Faculties</TabsTrigger>
        <TabsTrigger value="faculty-registration">
          Faculty Registration
        </TabsTrigger>
      </TabsList>
      <TabsContent value="all-teachers-table">
        <AllTeachersTable />
      </TabsContent>
      <TabsContent value="faculty-registration">
        <FacultyRegistrationForm />
      </TabsContent>
    </Tabs>
  );
}