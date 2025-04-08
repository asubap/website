

const EventMember = () => {
    return (
        <div className="w-full lg:w-1/2">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Upcoming Events</h2>

        <div className="max-h-[300px] overflow-y-auto pr-2 sm:pr-4 mb-8">
          <div className="border border-[#d9d9d9] rounded-lg p-3 sm:p-4 mb-4">
            <div className="flex justify-between">
              <h3 className="text-lg sm:text-xl font-bold">Title</h3>
            </div>
            <p className="text-[#555555] mb-2 text-sm sm:text-base">
              Description - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam dolor neque, accumsan nec
              commodo ac, tincidunt a lacus. Mauris tincidunt eget quam vel faucibus...
            </p>
            <div className="flex justify-end">
              <button className="bg-[#af272f] text-white px-3 sm:px-4 py-1 rounded-md hover:bg-[#8f1f26] transition-colors text-sm sm:text-base">
                View
              </button>
            </div>
          </div>

          <div className="border border-[#d9d9d9] rounded-lg p-3 sm:p-4">
            <div className="flex justify-between">
              <h3 className="text-lg sm:text-xl font-bold">Title</h3>
            </div>
            <p className="text-[#555555] mb-2 text-sm sm:text-base">
              Description - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam dolor neque, accumsan nec
              commodo ac, tincidunt a lacus. Mauris tincidunt eget quam vel faucibus...
            </p>
            <div className="flex justify-end">
              <button className="bg-[#af272f] text-white px-3 sm:px-4 py-1 rounded-md hover:bg-[#8f1f26] transition-colors text-sm sm:text-base">
                View
              </button>
            </div>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Past Events</h2>

        <div className="max-h-[300px] overflow-y-auto pr-2 sm:pr-4">
          <div className="border border-[#d9d9d9] rounded-lg p-3 sm:p-4">
            <div className="flex justify-between">
              <h3 className="text-lg sm:text-xl font-bold">Title</h3>
              <span className="text-[#555555] text-sm sm:text-base">Attended</span>
            </div>
            <p className="text-[#555555] mb-2 text-sm sm:text-base">
              Description - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam dolor neque, accumsan nec
              commodo ac, tincidunt a lacus. Mauris tincidunt eget quam vel faucibus...
            </p>
            <div className="flex justify-end">
              <button className="bg-[#af272f] text-white px-3 sm:px-4 py-1 rounded-md hover:bg-[#8f1f26] transition-colors text-sm sm:text-base">
                View
              </button>
            </div>
          </div>
        </div>
      </div>
    )
}

export default EventMember;