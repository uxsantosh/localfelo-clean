import clsx from "clsx";
type Group260HelperProps = {
  additionalClassNames?: string;
};

function Group260Helper({ additionalClassNames = "" }: Group260HelperProps) {
  return (
    <div style={{ "--transform-inner-width": "1200", "--transform-inner-height": "21" } as React.CSSProperties} className={clsx("absolute flex h-[48px] items-center justify-center top-[831px] w-[87px]", additionalClassNames)}>
      <div className="flex-none rotate-90">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative text-[72px] text-white whitespace-nowrap">{`>`}</p>
      </div>
    </div>
  );
}

export default function Group() {
  return (
    <div className="relative size-full">
      <div className="absolute bg-[#d9d9d9] h-[4353px] left-0 top-0 w-[1997px]" />
      <div className="absolute contents left-0 top-[127px]">
        <div className="absolute bg-[#a4a4a4] h-[312px] left-0 top-[127px] w-[1997px]" />
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[137px] not-italic text-[72px] text-black top-[239px] whitespace-nowrap">Global Header</p>
      </div>
      <div className="absolute contents left-0 top-[696px]">
        <div className="absolute bg-[#a4a4a4] h-[312px] left-0 top-[696px] w-[1997px]" />
      </div>
      <div className="absolute contents left-0 top-[399px]">
        <div className="absolute bg-[#767676] h-[296.52px] left-0 top-[399px] w-[1997px]" />
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal h-[83.497px] leading-[normal] left-[297px] not-italic text-[72px] text-black top-[430.04px] w-[555px]">Helper Mode</p>
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal h-[170.205px] leading-[normal] left-[297px] not-italic text-[51px] text-black top-[539.8px] w-[1611px]">Turn on helper mode to get immediate updates on new tasks, this will helps to show you task owners (some good ux copy)</p>
      </div>
      <div className="absolute bg-[#d9d9d9] h-[103px] left-[88px] rounded-[100px] top-[512px] w-[174px]" />
      <div className="absolute bg-[#3d3d3d] h-[75px] left-[103px] rounded-[100px] top-[526px] w-[88px]" />
      <div className="absolute bg-[#737373] h-[267px] left-[103px] top-[718px] w-[1407px]" />
      <div className="absolute bg-[#737373] h-[267px] left-[1560px] top-[718px] w-[331px]" />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[175px] not-italic text-[72px] text-white top-[801px] whitespace-pre">{`Main Cateories     (03 Selected)`}</p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[1626px] not-italic text-[72px] text-white top-[808px] whitespace-nowrap">5km</p>
      <div className="absolute left-[1510px] size-[386px] top-[3674px]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 386 386">
          <circle cx="193" cy="193" fill="var(--fill-0, #3A3A3A)" id="Ellipse 1" r="193" />
        </svg>
      </div>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[1656px] not-italic text-[142px] text-white top-[3765px] whitespace-nowrap">+</p>
      <Group260Helper additionalClassNames="left-[1361px]" />
      <Group260Helper additionalClassNames="left-[1795px]" />
    </div>
  );
}