import AlumniMembersList from "../../../components/admin/AlumniMembersList";

export function AlumniMembersSection() {
  return (
    <div className="order-8 md:order-8">
      <div className="flex items-center mb-2">
        <h2 className="text-2xl font-semibold">Alumni Members</h2>
      </div>
      <AlumniMembersList />
    </div>
  );
}
