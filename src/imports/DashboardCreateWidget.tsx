import svgPaths from "./svg-vmnsig04gh";
import { imgColor } from "./svg-bbd3l";

function Final2() {
  return (
    <div className="absolute inset-[69.34%_26.91%_0_12.71%]" data-name="Final_7_">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.0952 7.64835">
        <g id="Final_7_">
          <path d={svgPaths.p3c17b000} fill="var(--fill-0, #0D4F80)" id="Vector" />
          <path d={svgPaths.p167ec600} fill="var(--fill-0, #2FB9D8)" id="Vector_2" />
          <path d={svgPaths.p259c4080} fill="var(--fill-0, #5EBC6C)" id="Vector_3" />
        </g>
      </svg>
    </div>
  );
}

function Final1() {
  return (
    <div className="absolute inset-[0_0_5.71%_3.18%]" data-name="Final_6_">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24.2052 23.5253">
        <g id="Final_6_">
          <path d={svgPaths.p1ef00a00} fill="var(--fill-0, #0D4F80)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Final() {
  return (
    <div className="absolute inset-[32.14%_71.61%_16.7%_0]" data-name="Final_5_">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.09739 12.7648">
        <g id="Final_5_">
          <path d={svgPaths.pd793680} fill="var(--fill-0, #0D4F80)" id="Vector" />
          <path d={svgPaths.p32fa8500} fill="var(--fill-0, #1780C3)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents inset-0" data-name="Group">
      <Final2 />
      <Final1 />
      <Final />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents inset-0" data-name="Group">
      <Group1 />
    </div>
  );
}

function Frame13() {
  return (
    <div className="absolute h-[24.949px] left-[14px] top-[15px] w-[25px]">
      <Group />
    </div>
  );
}

function SidebarLogoSmallDashboard() {
  return (
    <div className="relative shrink-0 size-[54px]" data-name="Sidebar / Logo / Small / Dashboard">
      <Frame13 />
    </div>
  );
}

function UDashboard() {
  return (
    <div className="absolute inset-[8.33%]" data-name="u:dashboard">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="u:dashboard">
          <path d={svgPaths.p39c89900} fill="var(--fill-0, #364658)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame8() {
  return (
    <div className="absolute left-[15px] size-[24px] top-[8px]">
      <UDashboard />
    </div>
  );
}

function SidebarAcionSmallNormal() {
  return (
    <div className="bg-[#f9fafb] h-[40px] relative shrink-0 w-[54px]" data-name="Sidebar / Acion / Small / Normal">
      <div className="absolute bg-white h-[40px] left-0 opacity-0 top-0 w-[3px]" />
      <Frame8 />
    </div>
  );
}

function UTicket() {
  return (
    <div className="absolute inset-[8.33%]" data-name="u:ticket">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="u:ticket">
          <path d={svgPaths.p18645800} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame9() {
  return (
    <div className="absolute left-[15px] size-[24px] top-[8px]">
      <UTicket />
    </div>
  );
}

function SidebarAcionSmallNormal1() {
  return (
    <a className="bg-[#3279be] block cursor-pointer h-[40px] relative shrink-0 w-[54px]" data-name="Sidebar / Acion / Small / Normal" href="https://www.figma.com/proto/eZcTEPIok34wBGd36aFCeg/ITSM-UI-Improvement?page-id=0%3A1&node-id=2-4425&viewport=687%2C59%2C0.02&t=Zo6OgFkdt0OLHLp8-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=2%3A4425">
      <div className="absolute bg-[#3d8bd0] h-[40px] left-0 top-0 w-[3px]" />
      <Frame9 />
    </a>
  );
}

function UUserExclamation() {
  return (
    <div className="absolute inset-[8.33%]" data-name="u:user-exclamation">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="u:user-exclamation">
          <path d={svgPaths.p112e5e80} fill="var(--fill-0, #364658)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame10() {
  return (
    <div className="absolute left-[15px] size-[24px] top-[8px]">
      <UUserExclamation />
    </div>
  );
}

function SidebarAcionSmallActive() {
  return (
    <div className="bg-[#f9fafb] h-[40px] relative shrink-0 w-[54px]" data-name="Sidebar / Acion / Small / Active">
      <div className="absolute bg-white inset-[0_94.44%_0_0] opacity-0" />
      <Frame10 />
    </div>
  );
}

function URepeat() {
  return (
    <div className="absolute left-[2px] size-[20px] top-[2px]" data-name="u:repeat">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="u:repeat">
          <path d={svgPaths.p3dff02f0} fill="var(--fill-0, #364658)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame11() {
  return (
    <div className="absolute left-[15px] size-[24px] top-[8px]">
      <URepeat />
    </div>
  );
}

function SidebarAcionSmallNormal2() {
  return (
    <a className="bg-[#f9fafb] block cursor-pointer h-[40px] relative shrink-0 w-[54px]" data-name="Sidebar / Acion / Small / Normal" href="https://www.figma.com/proto/eZcTEPIok34wBGd36aFCeg/ITSM-UI-Improvement?page-id=0%3A1&node-id=2548-52206&viewport=-990%2C-1775%2C0.27&t=aQVdgqnrjOCD5mtb-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=2%3A4425">
      <div className="absolute bg-white h-[40px] left-0 opacity-0 top-0 w-[3px]" />
      <Frame11 />
    </a>
  );
}

function Share() {
  return (
    <div className="absolute inset-[8.33%]" data-name="share">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="share">
          <path d={svgPaths.p29f40200} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame12() {
  return (
    <div className="absolute left-[15px] size-[24px] top-[8px]">
      <Share />
    </div>
  );
}

function SidebarAcionSmallNormal3() {
  return (
    <div className="bg-[#f9fafb] h-[40px] relative shrink-0 w-[54px]" data-name="Sidebar / Acion / Small / Normal">
      <div className="absolute bg-white h-[40px] left-0 opacity-0 top-0 w-[3px]" />
      <Frame12 />
    </div>
  );
}

function Laptop() {
  return (
    <div className="absolute inset-[8.33%]" data-name="laptop">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="laptop">
          <g id="Icon">
            <path d={svgPaths.p154bf440} fill="var(--fill-0, #364658)" />
            <path d={svgPaths.p13319380} fill="var(--fill-0, #364658)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame14() {
  return (
    <div className="absolute left-[15px] size-[24px] top-[8px]">
      <Laptop />
    </div>
  );
}

function SidebarAcionSmallNormal4() {
  return (
    <div className="bg-[#f9fafb] h-[40px] relative shrink-0 w-[54px]" data-name="Sidebar / Acion / Small / Normal">
      <div className="absolute bg-white h-[40px] left-0 opacity-0 top-0 w-[3px]" />
      <Frame14 />
    </div>
  );
}

function Group13() {
  return (
    <div className="absolute inset-[7.69%_7.69%_7.8%_7.69%]">
      <div className="absolute inset-[-2.01%_-2%_-2%_-2.01%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.6015 17.5812">
          <g id="Group 65818">
            <path d={svgPaths.p2fac3400} id="Vector" stroke="var(--stroke-0, #364658)" strokeMiterlimit="10" strokeWidth="1.75" />
            <g id="Group">
              <path d={svgPaths.p3a0691fa} id="Vector_2" stroke="var(--stroke-0, #364658)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" />
              <path d={svgPaths.p193e052c} id="Vector_3" stroke="var(--stroke-0, #364658)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" />
            </g>
            <g id="Group_2">
              <path d={svgPaths.p2407d00} id="Vector_4" stroke="var(--stroke-0, #364658)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" />
              <path d={svgPaths.p5fd6600} id="Vector_5" stroke="var(--stroke-0, #364658)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" />
            </g>
            <g id="Group_3">
              <path d={svgPaths.pb49df68} id="Vector_6" stroke="var(--stroke-0, #364658)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" />
              <path d={svgPaths.p376c58c0} id="Vector_7" stroke="var(--stroke-0, #364658)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" />
            </g>
            <g id="Group_4">
              <path d={svgPaths.p1f6b8780} id="Vector_8" stroke="var(--stroke-0, #364658)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" />
              <path d={svgPaths.p2966e380} id="Vector_9" stroke="var(--stroke-0, #364658)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}

function Patch() {
  return (
    <div className="absolute inset-[8.33%] overflow-clip" data-name="Patch">
      <Group13 />
    </div>
  );
}

function Frame15() {
  return (
    <div className="absolute left-[15px] size-[24px] top-[8px]">
      <Patch />
    </div>
  );
}

function SidebarAcionSmallNormal5() {
  return (
    <div className="bg-[#f9fafb] h-[40px] relative shrink-0 w-[54px]" data-name="Sidebar / Acion / Small / Normal">
      <div className="absolute bg-white h-[40px] left-0 opacity-0 top-0 w-[3px]" />
      <Frame15 />
    </div>
  );
}

function Group14() {
  return (
    <div className="absolute inset-[8.33%_12.65%]">
      <div className="absolute inset-[-5.25%_-5.86%_-5.24%_-5.86%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6918 18.4167">
          <g id="Group 65819">
            <path d={svgPaths.p14b17a80} id="Vector" stroke="var(--stroke-0, #364658)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" />
            <path d={svgPaths.p39e75500} id="Vector_2" stroke="var(--stroke-0, #364658)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" />
            <path d="M8.34589 17.5417V9.17426" id="Vector_3" stroke="var(--stroke-0, #364658)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function FiBox() {
  return (
    <div className="absolute inset-[8.33%] overflow-clip" data-name="fi:box">
      <Group14 />
    </div>
  );
}

function Frame16() {
  return (
    <div className="absolute left-[15px] size-[24px] top-[8px]">
      <FiBox />
    </div>
  );
}

function SidebarAcionSmallNormal6() {
  return (
    <div className="bg-[#f9fafb] h-[40px] relative shrink-0 w-[54px]" data-name="Sidebar / Acion / Small / Normal">
      <div className="absolute bg-white h-[40px] left-0 opacity-0 top-0 w-[3px]" />
      <Frame16 />
    </div>
  );
}

function Projects() {
  return (
    <div className="absolute inset-[8.33%]" data-name="Projects">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Projects">
          <g id="Union">
            <path d={svgPaths.p2f532000} fill="var(--fill-0, #364658)" />
            <path d={svgPaths.p218cbc0} fill="var(--fill-0, #364658)" />
            <path d={svgPaths.p5e4b300} fill="var(--fill-0, #364658)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame17() {
  return (
    <div className="absolute left-[15px] size-[24px] top-[8px]">
      <Projects />
    </div>
  );
}

function SidebarAcionSmallNormal7() {
  return (
    <a className="bg-[#f9fafb] block cursor-pointer h-[40px] relative shrink-0 w-[54px]" data-name="Sidebar / Acion / Small / Normal" href="https://www.figma.com/proto/eZcTEPIok34wBGd36aFCeg/ITSM-UI-Improvement?page-id=4837%3A91610&node-id=5158-16093&viewport=1394%2C256%2C0.74&t=ULebrxlv4zx2Yv96-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=4948%3A64534&show-proto-sidebar=1">
      <div className="absolute bg-white h-[40px] left-0 opacity-0 top-0 w-[3px]" />
      <Frame17 />
    </a>
  );
}

function Color() {
  return (
    <div className="absolute inset-0 mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[1.666px_1.666px] mask-size-[16.666px_16.666px]" data-name="🎨 Color" style={{ maskImage: `url('${imgColor}')` }}>
      <div className="absolute bg-[#364658] inset-0" data-name="Base" />
    </div>
  );
}

function IconOutlineBulbTips() {
  return (
    <div className="absolute inset-[8.33%]" data-name="Icon/Outline/bulb_Tips">
      <div className="absolute inset-[8.33%_8.33%_8.34%_8.33%]" data-name="Mask">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.667 16.666">
          <path d={svgPaths.p3a7dc200} fill="var(--fill-0, #364658)" id="Mask" />
        </svg>
      </div>
      <Color />
    </div>
  );
}

function Frame18() {
  return (
    <div className="absolute left-[15px] size-[24px] top-[8px]">
      <IconOutlineBulbTips />
    </div>
  );
}

function SidebarAcionSmallNormal8() {
  return (
    <div className="bg-[#f9fafb] h-[40px] relative shrink-0 w-[54px]" data-name="Sidebar / Acion / Small / Normal">
      <div className="absolute bg-white h-[40px] left-0 opacity-0 top-0 w-[3px]" />
      <Frame18 />
    </div>
  );
}

function Report() {
  return (
    <div className="absolute inset-[8.33%]" data-name="Report">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Report">
          <path d={svgPaths.pb886280} fill="var(--fill-0, #364658)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame19() {
  return (
    <div className="absolute left-[15px] size-[24px] top-[8px]">
      <Report />
    </div>
  );
}

function SidebarAcionSmallNormal9() {
  return (
    <a className="bg-[#f9fafb] block cursor-pointer h-[40px] relative shrink-0 w-[54px]" data-name="Sidebar / Acion / Small / Normal" href="https://www.figma.com/proto/eZcTEPIok34wBGd36aFCeg/ITSM-UI-Improvement?page-id=0%3A1&node-id=4693-99986&viewport=-990%2C-1775%2C0.27&t=aQVdgqnrjOCD5mtb-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=2%3A4425&show-proto-sidebar=1">
      <div className="absolute bg-white h-[40px] left-0 opacity-0 top-0 w-[3px]" />
      <Frame19 />
    </a>
  );
}

function UserCheck() {
  return (
    <div className="absolute inset-[8.33%]" data-name="user-check">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="user-check">
          <path d={svgPaths.p2b20d100} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame20() {
  return (
    <div className="absolute left-[15px] size-[24px] top-[8px]">
      <UserCheck />
    </div>
  );
}

function SidebarAcionSmallNormal10() {
  return (
    <div className="bg-[#f9fafb] h-[40px] relative shrink-0 w-[54px]" data-name="Sidebar / Acion / Small / Normal">
      <div className="absolute bg-white h-[40px] left-0 opacity-0 top-0 w-[3px]" />
      <Frame20 />
    </div>
  );
}

function TasksRegular() {
  return (
    <div className="absolute inset-[8.33%]" data-name="tasks-regular 2">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="tasks-regular 2">
          <path d={svgPaths.p11d42d80} fill="var(--fill-0, #364658)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame21() {
  return (
    <div className="absolute left-[15px] size-[24px] top-[8px]">
      <TasksRegular />
    </div>
  );
}

function SidebarAcionSmallNormal11() {
  return (
    <div className="bg-[#f9fafb] h-[40px] relative shrink-0 w-[54px]" data-name="Sidebar / Acion / Small / Normal">
      <div className="absolute bg-white h-[40px] left-0 opacity-0 top-0 w-[3px]" />
      <Frame21 />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0">
      <SidebarLogoSmallDashboard />
      <SidebarAcionSmallNormal />
      <SidebarAcionSmallNormal1 />
      <SidebarAcionSmallActive />
      <SidebarAcionSmallNormal2 />
      <SidebarAcionSmallNormal3 />
      <SidebarAcionSmallNormal4 />
      <SidebarAcionSmallNormal5 />
      <SidebarAcionSmallNormal6 />
      <SidebarAcionSmallNormal7 />
      <SidebarAcionSmallNormal8 />
      <SidebarAcionSmallNormal9 />
      <SidebarAcionSmallNormal10 />
      <SidebarAcionSmallNormal11 />
    </div>
  );
}

function Final3() {
  return (
    <div className="col-1 h-[7.648px] ml-[12.71%] mt-[69.34%] relative row-1 w-[15.095px]" data-name="Final_7_">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.0952 7.64835">
        <g id="Final_7_">
          <path d={svgPaths.p3c17b000} fill="var(--fill-0, #0D4F80)" id="Vector" />
          <path d={svgPaths.p167ec600} fill="var(--fill-0, #2FB9D8)" id="Vector_2" />
          <path d={svgPaths.p259c4080} fill="var(--fill-0, #5EBC6C)" id="Vector_3" />
        </g>
      </svg>
    </div>
  );
}

function Final4() {
  return (
    <div className="col-1 h-[23.525px] ml-[3.18%] mt-0 relative row-1 w-[24.205px]" data-name="Final_6_">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24.2052 23.5253">
        <g id="Final_6_">
          <path d={svgPaths.p1ef00a00} fill="var(--fill-0, #0D4F80)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Final5() {
  return (
    <div className="col-1 h-[12.765px] ml-0 mt-[32.14%] relative row-1 w-[7.097px]" data-name="Final_5_">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.09739 12.7648">
        <g id="Final_5_">
          <path d={svgPaths.pd793680} fill="var(--fill-0, #0D4F80)" id="Vector" />
          <path d={svgPaths.p32fa8500} fill="var(--fill-0, #1780C3)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Group3() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-0 place-items-start relative row-1" data-name="Group">
      <Final3 />
      <Final4 />
      <Final5 />
    </div>
  );
}

function Group2() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="Group">
      <Group3 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0">
      <div className="flex h-[38px] items-center justify-center relative shrink-0 w-[24px]" style={{ "--transform-inner-width": "1185", "--transform-inner-height": "21" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <p className="font-['Poppins:SemiBold',sans-serif] leading-[normal] not-italic relative text-[#3279be] text-[16px]">ITSM</p>
        </div>
      </div>
      <Group2 />
    </div>
  );
}

function SideMenuWhite() {
  return (
    <div className="absolute bg-[#f9fafb] content-stretch flex flex-col h-[1010px] items-center justify-between left-0 pb-[20px] top-0 w-[54px]" data-name="Side Menu_White">
      <div aria-hidden="true" className="absolute border-[#dfe5ed] border-r border-solid inset-[0_-1px_0_0] pointer-events-none" />
      <Frame />
      <Frame1 />
    </div>
  );
}

function MotadataLogo() {
  return (
    <div className="h-[28.577px] relative shrink-0 w-[99.563px]" data-name="motadata logo">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 99.5625 28.5767">
        <g id="motadata logo">
          <path d={svgPaths.p2f2fe400} fill="url(#paint0_linear_1_3107)" id="Ellipse 1" />
          <path d={svgPaths.p2faf4780} fill="url(#paint1_linear_1_3107)" id="Path 1" />
          <path d={svgPaths.p47c1f00} fill="url(#paint2_linear_1_3107)" id="Path 2" />
          <path d={svgPaths.p3f5b3100} fill="url(#paint3_linear_1_3107)" id="Path 3" />
          <path d={svgPaths.p30a56e00} fill="url(#paint4_linear_1_3107)" id="Path 4" />
          <path d={svgPaths.p11a07200} fill="var(--fill-0, #363E50)" id="Path 5" />
          <path d={svgPaths.p1d114600} fill="var(--fill-0, #363E50)" id="Path 6" />
          <path d={svgPaths.p23a21000} fill="var(--fill-0, #363E50)" id="Path 7" />
          <path d={svgPaths.pff61c00} fill="var(--fill-0, #363E50)" id="Path 8" />
          <path d={svgPaths.p3a9a9100} fill="var(--fill-0, #363E50)" id="Path 9" />
          <path d={svgPaths.p310a3f00} fill="var(--fill-0, #363E50)" id="Path 10" />
          <path d={svgPaths.p1bbe2500} fill="var(--fill-0, #363E50)" id="Path 11" />
          <path d={svgPaths.p1d63eb80} fill="url(#paint5_linear_1_3107)" id="Path 12" />
          <path d={svgPaths.p2e79a972} fill="url(#paint6_linear_1_3107)" id="Ellipse 2" />
          <g id="Final">
            <path d={svgPaths.p3d83bd80} fill="var(--fill-0, #0F4F81)" id="Path 13" />
            <path d={svgPaths.pa18dc00} fill="var(--fill-0, #31BADA)" id="Path 14" />
            <path d={svgPaths.p69ff70} fill="var(--fill-0, #5FBD6C)" id="Path 15" />
          </g>
          <g id="Final-2">
            <path d={svgPaths.p10194350} fill="var(--fill-0, #0F4F81)" id="Path 16" />
          </g>
          <g id="Final-3">
            <path d={svgPaths.p272c60b2} fill="var(--fill-0, #0F4F81)" id="Path 17" />
            <path d={svgPaths.p3cd4aec0} fill="var(--fill-0, #1A81C4)" id="Path 18" />
          </g>
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_1_3107" x1="34.7424" x2="88.3066" y1="24.9025" y2="26.1903">
            <stop stopColor="#10122A" />
            <stop offset="0.03" stopColor="#112849" />
            <stop offset="0.09" stopColor="#14578B" />
            <stop offset="0.14" stopColor="#1575B4" />
            <stop offset="0.16" stopColor="#1680C4" />
            <stop offset="0.35" stopColor="#1885C6" />
            <stop offset="0.56" stopColor="#1F92CB" />
            <stop offset="0.79" stopColor="#29A9D4" />
            <stop offset="0.92" stopColor="#31BADA" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_1_3107" x1="34.8391" x2="88.3674" y1="25.0435" y2="26.3329">
            <stop stopColor="#10122A" />
            <stop offset="0.06" stopColor="#112240" />
            <stop offset="0.2" stopColor="#134A79" />
            <stop offset="0.35" stopColor="#1680C4" />
            <stop offset="0.46" stopColor="#1C8DC9" />
            <stop offset="0.65" stopColor="#2CB0D6" />
            <stop offset="0.7" stopColor="#31BADA" />
            <stop offset="0.84" stopColor="#43BBAA" />
            <stop offset="1" stopColor="#59BC6E" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_1_3107" x1="34.3742" x2="87.916" y1="23.6192" y2="24.9146">
            <stop stopColor="#10122A" />
            <stop offset="0.06" stopColor="#112240" />
            <stop offset="0.2" stopColor="#134A79" />
            <stop offset="0.35" stopColor="#1680C4" />
            <stop offset="0.46" stopColor="#1C8DC9" />
            <stop offset="0.65" stopColor="#2CB0D6" />
            <stop offset="0.7" stopColor="#31BADA" />
            <stop offset="0.84" stopColor="#43BBAA" />
            <stop offset="1" stopColor="#59BC6E" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint3_linear_1_3107" x1="33.0731" x2="86.9829" y1="20.4169" y2="21.715">
            <stop stopColor="#10122A" />
            <stop offset="0.06" stopColor="#112240" />
            <stop offset="0.2" stopColor="#134A79" />
            <stop offset="0.35" stopColor="#1680C4" />
            <stop offset="0.46" stopColor="#1C8DC9" />
            <stop offset="0.65" stopColor="#2CB0D6" />
            <stop offset="0.7" stopColor="#31BADA" />
            <stop offset="0.84" stopColor="#43BBAA" />
            <stop offset="1" stopColor="#59BC6E" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint4_linear_1_3107" x1="25.4342" x2="79.3255" y1="15.0733" y2="16.3623">
            <stop stopColor="#10122A" />
            <stop offset="0.06" stopColor="#112240" />
            <stop offset="0.2" stopColor="#134A79" />
            <stop offset="0.35" stopColor="#1680C4" />
            <stop offset="0.46" stopColor="#1C8DC9" />
            <stop offset="0.65" stopColor="#2CB0D6" />
            <stop offset="0.7" stopColor="#31BADA" />
            <stop offset="0.84" stopColor="#43BBAA" />
            <stop offset="1" stopColor="#59BC6E" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint5_linear_1_3107" x1="-15.7663" x2="105.969" y1="11.326" y2="28.979">
            <stop stopColor="#10122A" />
            <stop offset="0.64" stopColor="#1680C4" />
            <stop offset="0.77" stopColor="#1782C5" />
            <stop offset="0.83" stopColor="#1B8AC8" />
            <stop offset="0.88" stopColor="#2197CD" />
            <stop offset="0.92" stopColor="#29AAD4" />
            <stop offset="0.95" stopColor="#31BADA" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint6_linear_1_3107" x1="-16.1904" x2="105.383" y1="14.6839" y2="32.3007">
            <stop stopColor="#10122A" />
            <stop offset="0.09" stopColor="#112849" />
            <stop offset="0.31" stopColor="#14578B" />
            <stop offset="0.47" stopColor="#1575B4" />
            <stop offset="0.55" stopColor="#1680C4" />
            <stop offset="0.64" stopColor="#1885C6" />
            <stop offset="0.75" stopColor="#1F92CB" />
            <stop offset="0.86" stopColor="#29A9D4" />
            <stop offset="0.92" stopColor="#31BADA" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function IconWrapper() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[99.563px]" data-name="icon wrapper">
      <MotadataLogo />
    </div>
  );
}

function UPlus() {
  return (
    <div className="col-1 ml-[5px] mt-[5px] relative row-1 size-[20px]" data-name="u:plus">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="u:plus">
          <path d={svgPaths.p2d69d000} fill="var(--fill-0, white)" id="Vector" stroke="var(--stroke-0, white)" />
        </g>
      </svg>
    </div>
  );
}

function Group34() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <div className="bg-[#3d8bd0] col-1 ml-0 mt-0 rounded-[8px] row-1 size-[30px]" />
      <UPlus />
    </div>
  );
}

function IconHoverBg() {
  return (
    <div className="col-1 ml-0 mt-0 relative row-1 size-[30px]" data-name="Icon Hover BG">
      <div className="absolute bg-[#eef2f6] inset-0 opacity-0 rounded-[8px]" />
    </div>
  );
}

function UCalender() {
  return (
    <div className="col-1 ml-[5px] mt-[5px] relative row-1 size-[20px]" data-name="u:calender">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="u:calender">
          <path d={svgPaths.p12f8b100} fill="var(--fill-0, #7B8FA5)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group15() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <IconHoverBg />
      <UCalender />
    </div>
  );
}

function IconHoverBg1() {
  return (
    <div className="col-1 ml-0 mt-0 relative row-1 size-[30px]" data-name="Icon Hover BG">
      <div className="absolute bg-[#eef2f6] inset-0 opacity-0 rounded-[8px]" />
    </div>
  );
}

function Notification() {
  return (
    <div className="col-1 ml-[5px] mt-[5px] relative row-1 size-[20px]" data-name="notification">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="notification">
          <path d={svgPaths.p1f632300} fill="var(--fill-0, #7B8FA5)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Group16() {
  return (
    <a className="cursor-pointer grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0" href="https://www.figma.com/proto/eZcTEPIok34wBGd36aFCeg/ITSM-UI-Improvement?page-id=0%3A1&node-id=5158-118884&viewport=-990%2C-1775%2C0.27&t=aQVdgqnrjOCD5mtb-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=2%3A4425&show-proto-sidebar=1">
      <IconHoverBg1 />
      <Notification />
    </a>
  );
}

function IconHoverBg2() {
  return (
    <div className="col-1 ml-0 mt-0 relative row-1 size-[30px]" data-name="Icon Hover BG">
      <div className="absolute bg-[#eef2f6] inset-0 opacity-0 rounded-[8px]" />
    </div>
  );
}

function Settings() {
  return (
    <div className="col-1 ml-[5px] mt-[5px] relative row-1 size-[20px]" data-name="settings">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="settings">
          <g id="Icon">
            <path d={svgPaths.p33748700} fill="var(--fill-0, #7B8FA5)" />
            <path d={svgPaths.p231a11c0} fill="var(--fill-0, #7B8FA5)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Group17() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <IconHoverBg2 />
      <Settings />
    </div>
  );
}

function IconHoverBg3() {
  return (
    <div className="col-1 ml-0 mt-0 relative row-1 size-[30px]" data-name="Icon Hover BG">
      <div className="absolute bg-[#eef2f6] inset-0 opacity-0 rounded-[8px]" />
    </div>
  );
}

function UKeyboard() {
  return (
    <div className="col-1 ml-[5px] mt-[5px] relative row-1 size-[20px]" data-name="u:keyboard">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="u:keyboard">
          <path d={svgPaths.p1cf41970} fill="var(--fill-0, #7B8FA5)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group18() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <IconHoverBg3 />
      <UKeyboard />
    </div>
  );
}

function IconHoverBg4() {
  return (
    <div className="col-1 ml-0 mt-0 relative row-1 size-[30px]" data-name="Icon Hover BG">
      <div className="absolute bg-[#eef2f6] inset-0 opacity-0 rounded-[8px]" />
    </div>
  );
}

function CircleWarning() {
  return (
    <div className="col-1 ml-[5px] mt-[5px] relative row-1 size-[20px]" data-name="circle-warning">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="circle-warning">
          <g id="Icon">
            <path d={svgPaths.p2265900} fill="var(--fill-0, #7B8FA5)" />
            <path d={svgPaths.p2c325880} fill="var(--fill-0, #7B8FA5)" />
            <path d={svgPaths.p2329c680} fill="var(--fill-0, #7B8FA5)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Group19() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <IconHoverBg4 />
      <CircleWarning />
    </div>
  );
}

function Frame77() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <Group15 />
      <Group16 />
      <Group17 />
      <Group18 />
      <Group19 />
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-end relative shrink-0">
      <Group34 />
      <Frame77 />
    </div>
  );
}

function Group36() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <div className="bg-[#3d8bd0] col-1 ml-0 mt-0 rounded-[8px] row-1 size-[30px]" />
      <p className="col-1 font-['Poppins:SemiBold',sans-serif] leading-[1.5] ml-[5.5px] mt-[4.5px] not-italic relative row-1 text-[14px] text-white">AS</p>
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex gap-[12px] items-center leading-[0] relative shrink-0">
      <Frame6 />
      <Group36 />
    </div>
  );
}

function Frame72() {
  return (
    <div className="absolute bg-white content-stretch flex items-center justify-between left-[55px] p-[12px] top-0 w-[1865px]">
      <div aria-hidden="true" className="absolute border-[#dfe5ed] border-b border-solid inset-0 pointer-events-none" />
      <IconWrapper />
      <Frame7 />
    </div>
  );
}

function Group66() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <p className="col-1 font-['Poppins:Regular',sans-serif] leading-[20px] ml-0 mt-0 not-italic relative row-1 text-[#364658] text-[12px]">All Open Requests</p>
    </div>
  );
}

function ChevronDown() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="chevron-down">
          <path d={svgPaths.p4c5d800} fill="var(--fill-0, #7B8FA5)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function SelectDropdownWithIconAndArrow() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center justify-between min-h-px min-w-px relative rounded-[8px]" data-name="Select Dropdown with icon and arrow">
      <Group66 />
      <ChevronDown />
    </div>
  );
}

function DropdownHover() {
  return (
    <div className="content-stretch flex items-start px-[8px] py-[6px] relative rounded-[8px] shrink-0 w-[149px]" data-name="dropdown hover">
      <SelectDropdownWithIconAndArrow />
    </div>
  );
}

function Frame70() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#364658] text-[16px] text-justify">Requests</p>
      <DropdownHover />
    </div>
  );
}

function UFileExport() {
  return (
    <div className="col-1 ml-[7px] mt-[7px] relative row-1 size-[16px]" data-name="u:file-export">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="u:file-export">
          <path d={svgPaths.p13df7600} fill="var(--fill-0, #7B8FA5)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group42() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <div className="border border-[#dfe5ed] border-solid col-1 ml-0 mt-0 rounded-[8px] row-1 size-[30px]" />
      <UFileExport />
    </div>
  );
}

function Download() {
  return (
    <div className="col-1 ml-[7px] mt-[7px] relative row-1 size-[16px]" data-name="download">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="download">
          <path d={svgPaths.p1a919500} fill="var(--fill-0, #7B8FA5)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Group43() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <div className="border border-[#dfe5ed] border-solid col-1 ml-0 mt-0 rounded-[8px] row-1 size-[30px]" />
      <Download />
    </div>
  );
}

function Refresh() {
  return (
    <div className="col-1 ml-[7px] mt-[7px] relative row-1 size-[16px]" data-name="refresh">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="refresh">
          <path d={svgPaths.p2c0cab00} fill="var(--fill-0, #7B8FA5)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Group44() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <div className="border border-[#dfe5ed] border-solid col-1 ml-0 mt-0 rounded-[8px] row-1 size-[30px]" />
      <Refresh />
    </div>
  );
}

function UGrids() {
  return (
    <div className="col-1 ml-[7px] mt-[7px] relative row-1 size-[16px]" data-name="u:grids">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="u:grids">
          <path d={svgPaths.p6a5700} fill="var(--fill-0, #7B8FA5)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group45() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <div className="border border-[#dfe5ed] border-solid col-1 ml-0 mt-0 rounded-[8px] row-1 size-[30px]" />
      <UGrids />
    </div>
  );
}

function Kanban() {
  return (
    <div className="col-1 ml-[7px] mt-[7px] relative row-1 size-[16px]" data-name="kanban">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="kanban">
          <path d={svgPaths.p13d42400} fill="var(--fill-0, #7B8FA5)" id="Vector (Stroke)" />
        </g>
      </svg>
    </div>
  );
}

function Group46() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <div className="border border-[#dfe5ed] border-solid col-1 ml-0 mt-0 rounded-[8px] row-1 size-[30px]" />
      <Kanban />
    </div>
  );
}

function UFileExport1() {
  return (
    <div className="col-1 ml-[7px] mt-[7px] relative row-1 size-[16px]" data-name="u:file-export">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="u:file-export">
          <path d={svgPaths.p13df7600} fill="var(--fill-0, #7B8FA5)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group47() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <div className="border border-[#dfe5ed] border-solid col-1 ml-0 mt-0 rounded-[8px] row-1 size-[30px]" />
      <UFileExport1 />
    </div>
  );
}

function Frame228() {
  return (
    <div className="content-stretch flex gap-[6px] items-center leading-[0] relative shrink-0">
      <Group42 />
      <Group43 />
      <Group44 />
      <Group45 />
      <Group46 />
      <Group47 />
    </div>
  );
}

function Frame227() {
  return (
    <div className="absolute content-stretch flex items-center justify-between left-[55px] px-[12px] top-[66px] w-[1865px]">
      <Frame70 />
      <Frame228 />
    </div>
  );
}

function Frame22() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[40px] items-start left-0 top-[24.98px] w-[1865px]">
      <div className="bg-[#dfe5ed] h-px opacity-0 shrink-0 w-full" />
      <div className="bg-[#dfe5ed] h-px opacity-70 shrink-0 w-full" />
      <div className="bg-[#dfe5ed] h-px opacity-70 shrink-0 w-full" />
      <div className="bg-[#dfe5ed] h-px opacity-70 shrink-0 w-full" />
      <div className="bg-[#dfe5ed] h-px opacity-70 shrink-0 w-full" />
      <div className="bg-[#dfe5ed] h-px opacity-70 shrink-0 w-full" />
      <div className="bg-[#dfe5ed] h-px opacity-70 shrink-0 w-full" />
      <div className="bg-[#dfe5ed] h-px opacity-70 shrink-0 w-full" />
      <div className="bg-[#dfe5ed] h-px opacity-70 shrink-0 w-full" />
      <div className="bg-[#dfe5ed] h-px opacity-70 shrink-0 w-full" />
      <div className="bg-[#dfe5ed] h-px opacity-70 shrink-0 w-full" />
      <div className="bg-[#dfe5ed] h-px opacity-70 shrink-0 w-full" />
      <div className="bg-[#dfe5ed] h-px opacity-70 shrink-0 w-full" />
      <div className="bg-[#dfe5ed] h-px opacity-70 shrink-0 w-full" />
      <div className="bg-[#dfe5ed] h-px opacity-70 shrink-0 w-full" />
      <div className="bg-[#dfe5ed] h-px opacity-70 shrink-0 w-full" />
      <div className="bg-[#dfe5ed] h-px opacity-70 shrink-0 w-full" />
      <div className="bg-[#dfe5ed] h-px opacity-70 shrink-0 w-full" />
      <div className="bg-[#dfe5ed] h-px opacity-70 shrink-0 w-full" />
      <div className="bg-[#dfe5ed] h-px opacity-70 shrink-0 w-full" />
    </div>
  );
}

function StripedWhiteGridBgHover() {
  return (
    <div className="h-[41px] opacity-0 relative shrink-0 w-full" data-name="Striped White Grid BG Hover">
      <div className="absolute flex inset-0 items-center justify-center">
        <div className="-scale-y-100 flex-none h-[41px] w-[1865.217px]">
          <div className="bg-[rgba(223,229,237,0.05)] size-full" />
        </div>
      </div>
    </div>
  );
}

function StripedWhiteGridBgHover1() {
  return (
    <div className="h-[41px] opacity-0 relative shrink-0 w-full" data-name="Striped White Grid BG Hover">
      <div className="absolute flex inset-0 items-center justify-center">
        <div className="-scale-y-100 flex-none h-[41px] w-[1865.217px]">
          <div className="bg-[rgba(223,229,237,0.05)] size-full" />
        </div>
      </div>
    </div>
  );
}

function StripedWhiteGridBgHover2() {
  return (
    <div className="h-[41px] opacity-0 relative shrink-0 w-full" data-name="Striped White Grid BG Hover">
      <div className="absolute flex inset-0 items-center justify-center">
        <div className="-scale-y-100 flex-none h-[41px] w-[1865.217px]">
          <div className="bg-[rgba(223,229,237,0.05)] size-full" />
        </div>
      </div>
    </div>
  );
}

function StripedWhiteGridBgHover3() {
  return (
    <div className="h-[41px] opacity-0 relative shrink-0 w-full" data-name="Striped White Grid BG Hover">
      <div className="absolute flex inset-0 items-center justify-center">
        <div className="-scale-y-100 flex-none h-[41px] w-[1865.217px]">
          <div className="bg-[rgba(223,229,237,0.05)] size-full" />
        </div>
      </div>
    </div>
  );
}

function StripedWhiteGridBgHover4() {
  return (
    <div className="h-[41px] opacity-0 relative shrink-0 w-full" data-name="Striped White Grid BG Hover">
      <div className="absolute flex inset-0 items-center justify-center">
        <div className="-scale-y-100 flex-none h-[41px] w-[1865.217px]">
          <div className="bg-[rgba(223,229,237,0.05)] size-full" />
        </div>
      </div>
    </div>
  );
}

function StripedWhiteGridBgHover5() {
  return (
    <div className="h-[41px] relative shrink-0 w-full" data-name="Striped White Grid BG Hover">
      <div className="absolute flex inset-0 items-center justify-center">
        <div className="-scale-y-100 flex-none h-[41px] w-[1865.217px]">
          <div className="bg-[rgba(223,229,237,0.2)] size-full" />
        </div>
      </div>
    </div>
  );
}

function StripedWhiteGridBgHover6() {
  return (
    <div className="h-[41px] opacity-0 relative shrink-0 w-full" data-name="Striped White Grid BG Hover">
      <div className="absolute flex inset-0 items-center justify-center">
        <div className="-scale-y-100 flex-none h-[41px] w-[1865.217px]">
          <div className="bg-[rgba(223,229,237,0.05)] size-full" />
        </div>
      </div>
    </div>
  );
}

function StripedWhiteGridBgHover7() {
  return (
    <div className="h-[41px] opacity-0 relative shrink-0 w-full" data-name="Striped White Grid BG Hover">
      <div className="absolute flex inset-0 items-center justify-center">
        <div className="-scale-y-100 flex-none h-[41px] w-[1865.217px]">
          <div className="bg-[rgba(223,229,237,0.05)] size-full" />
        </div>
      </div>
    </div>
  );
}

function StripedWhiteGridBgHover8() {
  return (
    <div className="h-[41px] opacity-0 relative shrink-0 w-full" data-name="Striped White Grid BG Hover">
      <div className="absolute flex inset-0 items-center justify-center">
        <div className="-scale-y-100 flex-none h-[41px] w-[1865.217px]">
          <div className="bg-[rgba(223,229,237,0.05)] size-full" />
        </div>
      </div>
    </div>
  );
}

function StripedWhiteGridBgHover9() {
  return (
    <div className="h-[41px] opacity-0 relative shrink-0 w-full" data-name="Striped White Grid BG Hover">
      <div className="absolute flex inset-0 items-center justify-center">
        <div className="-scale-y-100 flex-none h-[41px] w-[1865.217px]">
          <div className="bg-[rgba(223,229,237,0.05)] size-full" />
        </div>
      </div>
    </div>
  );
}

function StripedWhiteGridBgHover10() {
  return (
    <div className="h-[41px] opacity-0 relative shrink-0 w-full" data-name="Striped White Grid BG Hover">
      <div className="absolute flex inset-0 items-center justify-center">
        <div className="-scale-y-100 flex-none h-[41px] w-[1865.217px]">
          <div className="bg-[rgba(223,229,237,0.05)] size-full" />
        </div>
      </div>
    </div>
  );
}

function StripedWhiteGridBgHover11() {
  return (
    <div className="h-[41px] opacity-0 relative shrink-0 w-full" data-name="Striped White Grid BG Hover">
      <div className="absolute flex inset-0 items-center justify-center">
        <div className="-scale-y-100 flex-none h-[41px] w-[1865.217px]">
          <div className="bg-[rgba(223,229,237,0.05)] size-full" />
        </div>
      </div>
    </div>
  );
}

function StripedWhiteGridBgHover12() {
  return (
    <div className="h-[41px] opacity-0 relative shrink-0 w-full" data-name="Striped White Grid BG Hover">
      <div className="absolute flex inset-0 items-center justify-center">
        <div className="-scale-y-100 flex-none h-[41px] w-[1865.217px]">
          <div className="bg-[rgba(223,229,237,0.05)] size-full" />
        </div>
      </div>
    </div>
  );
}

function StripedWhiteGridBgHover13() {
  return (
    <div className="h-[41px] opacity-0 relative shrink-0 w-full" data-name="Striped White Grid BG Hover">
      <div className="absolute flex inset-0 items-center justify-center">
        <div className="-scale-y-100 flex-none h-[41px] w-[1865.217px]">
          <div className="bg-[rgba(223,229,237,0.05)] size-full" />
        </div>
      </div>
    </div>
  );
}

function StripedWhiteGridBgHover14() {
  return (
    <div className="h-[41px] opacity-0 relative shrink-0 w-full" data-name="Striped White Grid BG Hover">
      <div className="absolute flex inset-0 items-center justify-center">
        <div className="-scale-y-100 flex-none h-[41px] w-[1865.217px]">
          <div className="bg-[rgba(223,229,237,0.05)] size-full" />
        </div>
      </div>
    </div>
  );
}

function StripedWhiteGridBgHover15() {
  return (
    <div className="h-[41px] opacity-0 relative shrink-0 w-full" data-name="Striped White Grid BG Hover">
      <div className="absolute flex inset-0 items-center justify-center">
        <div className="-scale-y-100 flex-none h-[41px] w-[1865.217px]">
          <div className="bg-[rgba(223,229,237,0.05)] size-full" />
        </div>
      </div>
    </div>
  );
}

function StripedWhiteGridBgHover16() {
  return (
    <div className="h-[41px] opacity-0 relative shrink-0 w-full" data-name="Striped White Grid BG Hover">
      <div className="absolute flex inset-0 items-center justify-center">
        <div className="-scale-y-100 flex-none h-[41px] w-[1865.217px]">
          <div className="bg-[rgba(223,229,237,0.05)] size-full" />
        </div>
      </div>
    </div>
  );
}

function StripedWhiteGridBgHover17() {
  return (
    <div className="h-[41px] opacity-0 relative shrink-0 w-full" data-name="Striped White Grid BG Hover">
      <div className="absolute flex inset-0 items-center justify-center">
        <div className="-scale-y-100 flex-none h-[41px] w-[1865.217px]">
          <div className="bg-[rgba(223,229,237,0.05)] size-full" />
        </div>
      </div>
    </div>
  );
}

function StripedWhiteGridBgHover18() {
  return (
    <div className="h-[41px] opacity-0 relative shrink-0 w-full" data-name="Striped White Grid BG Hover">
      <div className="absolute flex inset-0 items-center justify-center">
        <div className="-scale-y-100 flex-none h-[41px] w-[1865.217px]">
          <div className="bg-[rgba(223,229,237,0.05)] size-full" />
        </div>
      </div>
    </div>
  );
}

function StripedWhiteGridBgHover19() {
  return (
    <div className="h-[41px] opacity-0 relative shrink-0 w-full" data-name="Striped White Grid BG Hover">
      <div className="absolute flex inset-0 items-center justify-center">
        <div className="-scale-y-100 flex-none h-[41px] w-[1865.217px]">
          <div className="bg-[rgba(223,229,237,0.05)] size-full" />
        </div>
      </div>
    </div>
  );
}

function Frame23() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 top-[24.98px] w-[1865.217px]">
      <StripedWhiteGridBgHover />
      <StripedWhiteGridBgHover1 />
      <StripedWhiteGridBgHover2 />
      <StripedWhiteGridBgHover3 />
      <StripedWhiteGridBgHover4 />
      <StripedWhiteGridBgHover5 />
      <StripedWhiteGridBgHover6 />
      <StripedWhiteGridBgHover7 />
      <StripedWhiteGridBgHover8 />
      <StripedWhiteGridBgHover9 />
      <StripedWhiteGridBgHover10 />
      <StripedWhiteGridBgHover11 />
      <StripedWhiteGridBgHover12 />
      <StripedWhiteGridBgHover13 />
      <StripedWhiteGridBgHover14 />
      <StripedWhiteGridBgHover15 />
      <StripedWhiteGridBgHover16 />
      <StripedWhiteGridBgHover17 />
      <StripedWhiteGridBgHover18 />
      <StripedWhiteGridBgHover19 />
    </div>
  );
}

function Checkbox() {
  return (
    <div className="absolute inset-[0.04%_98.45%_97.68%_0.59%]" data-name="Checkbox">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Checkbox">
          <path d={svgPaths.p286983f0} id="Path" stroke="var(--stroke-0, #A5BAD0)" />
        </g>
      </svg>
    </div>
  );
}

function Checkbox1() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Checkbox">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Checkbox">
          <path d={svgPaths.p286983f0} id="Path" stroke="var(--stroke-0, #A5BAD0)" />
        </g>
      </svg>
    </div>
  );
}

function Checkbox2() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Checkbox">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Checkbox">
          <path d={svgPaths.p286983f0} id="Path" stroke="var(--stroke-0, #A5BAD0)" />
        </g>
      </svg>
    </div>
  );
}

function Checkbox3() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Checkbox">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Checkbox">
          <path d={svgPaths.p286983f0} id="Path" stroke="var(--stroke-0, #A5BAD0)" />
        </g>
      </svg>
    </div>
  );
}

function Checkbox4() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Checkbox">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Checkbox">
          <path d={svgPaths.p286983f0} id="Path" stroke="var(--stroke-0, #A5BAD0)" />
        </g>
      </svg>
    </div>
  );
}

function Checkbox5() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Checkbox">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Checkbox">
          <path d={svgPaths.p286983f0} id="Path" stroke="var(--stroke-0, #A5BAD0)" />
        </g>
      </svg>
    </div>
  );
}

function Checkbox6() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Checkbox">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Checkbox">
          <path clipRule="evenodd" d={svgPaths.p2eee0480} fill="var(--fill-0, #3D8BD0)" fillRule="evenodd" id="Path" />
          <path d={svgPaths.p16006580} id="Vector 8" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function Checkbox7() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Checkbox">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Checkbox">
          <path d={svgPaths.p286983f0} id="Path" stroke="var(--stroke-0, #A5BAD0)" />
        </g>
      </svg>
    </div>
  );
}

function Checkbox8() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Checkbox">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Checkbox">
          <path d={svgPaths.p286983f0} id="Path" stroke="var(--stroke-0, #A5BAD0)" />
        </g>
      </svg>
    </div>
  );
}

function Checkbox9() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Checkbox">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Checkbox">
          <path d={svgPaths.p286983f0} id="Path" stroke="var(--stroke-0, #A5BAD0)" />
        </g>
      </svg>
    </div>
  );
}

function Checkbox10() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Checkbox">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Checkbox">
          <path d={svgPaths.p286983f0} id="Path" stroke="var(--stroke-0, #A5BAD0)" />
        </g>
      </svg>
    </div>
  );
}

function Checkbox11() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Checkbox">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Checkbox">
          <path d={svgPaths.p286983f0} id="Path" stroke="var(--stroke-0, #A5BAD0)" />
        </g>
      </svg>
    </div>
  );
}

function Checkbox12() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Checkbox">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Checkbox">
          <path d={svgPaths.p286983f0} id="Path" stroke="var(--stroke-0, #A5BAD0)" />
        </g>
      </svg>
    </div>
  );
}

function Checkbox13() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Checkbox">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Checkbox">
          <path d={svgPaths.p286983f0} id="Path" stroke="var(--stroke-0, #A5BAD0)" />
        </g>
      </svg>
    </div>
  );
}

function Checkbox14() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Checkbox">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Checkbox">
          <path d={svgPaths.p286983f0} id="Path" stroke="var(--stroke-0, #A5BAD0)" />
        </g>
      </svg>
    </div>
  );
}

function Checkbox15() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Checkbox">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Checkbox">
          <path d={svgPaths.p286983f0} id="Path" stroke="var(--stroke-0, #A5BAD0)" />
        </g>
      </svg>
    </div>
  );
}

function Checkbox16() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Checkbox">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Checkbox">
          <path d={svgPaths.p286983f0} id="Path" stroke="var(--stroke-0, #A5BAD0)" />
        </g>
      </svg>
    </div>
  );
}

function Checkbox17() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Checkbox">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Checkbox">
          <path d={svgPaths.p286983f0} id="Path" stroke="var(--stroke-0, #A5BAD0)" />
        </g>
      </svg>
    </div>
  );
}

function Checkbox18() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Checkbox">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Checkbox">
          <path d={svgPaths.p286983f0} id="Path" stroke="var(--stroke-0, #A5BAD0)" />
        </g>
      </svg>
    </div>
  );
}

function Checkbox19() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Checkbox">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Checkbox">
          <path d={svgPaths.p286983f0} id="Path" stroke="var(--stroke-0, #A5BAD0)" />
        </g>
      </svg>
    </div>
  );
}

function Checkbox20() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Checkbox">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Checkbox">
          <path d={svgPaths.p286983f0} id="Path" stroke="var(--stroke-0, #A5BAD0)" />
        </g>
      </svg>
    </div>
  );
}

function Frame24() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[23px] items-start left-[11.02px] top-[36.65px]">
      <Checkbox1 />
      <Checkbox2 />
      <Checkbox3 />
      <Checkbox4 />
      <Checkbox5 />
      <Checkbox6 />
      <Checkbox7 />
      <Checkbox8 />
      <Checkbox9 />
      <Checkbox10 />
      <Checkbox11 />
      <Checkbox12 />
      <Checkbox13 />
      <Checkbox14 />
      <Checkbox15 />
      <Checkbox16 />
      <Checkbox17 />
      <Checkbox18 />
      <Checkbox19 />
      <Checkbox20 />
    </div>
  );
}

function Group21() {
  return (
    <div className="absolute contents left-[11px] top-[0.32px]">
      <Checkbox />
      <Frame24 />
    </div>
  );
}

function Frame26() {
  return (
    <div className="col-1 content-stretch flex gap-[4px] items-center ml-0 mt-0 relative row-1">
      <p className="font-['Poppins:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#364658] text-[12px]">ID</p>
      <div className="h-[8px] relative shrink-0 w-[10.126px]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <path d={svgPaths.p35b74300} fill="var(--fill-0, #364658)" id="Vector" opacity="0" />
        </svg>
      </div>
    </div>
  );
}

function Group24() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-0 place-items-start relative row-1">
      <Frame26 />
    </div>
  );
}

function Frame37() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <p className="font-['Poppins:Medium',sans-serif] leading-[22px] not-italic relative shrink-0 text-[#3279be] text-[12px]">SR-89</p>
    </div>
  );
}

function Frame54() {
  return (
    <div className="bg-[rgba(50,121,190,0.2)] content-stretch flex items-center justify-center px-[4px] relative rounded-[4px] shrink-0">
      <Frame37 />
    </div>
  );
}

function Frame38() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <p className="font-['Poppins:Medium',sans-serif] leading-[22px] not-italic relative shrink-0 text-[#3279be] text-[12px]">SR-88</p>
    </div>
  );
}

function Frame55() {
  return (
    <div className="bg-[rgba(50,121,190,0.2)] content-stretch flex items-start px-[4px] relative rounded-[4px] shrink-0">
      <Frame38 />
    </div>
  );
}

function Frame39() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <p className="font-['Poppins:Medium',sans-serif] leading-[22px] not-italic relative shrink-0 text-[#3279be] text-[12px]">INC-34</p>
    </div>
  );
}

function Frame56() {
  return (
    <div className="bg-[rgba(50,121,190,0.2)] content-stretch flex items-start px-[4px] relative rounded-[4px] shrink-0">
      <Frame39 />
    </div>
  );
}

function Frame40() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <p className="font-['Poppins:Medium',sans-serif] leading-[22px] not-italic relative shrink-0 text-[#3279be] text-[12px]">INC-33</p>
    </div>
  );
}

function Frame58() {
  return (
    <div className="bg-[rgba(50,121,190,0.2)] content-stretch flex items-start px-[4px] relative rounded-[3px] shrink-0">
      <Frame40 />
    </div>
  );
}

function Frame41() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <p className="font-['Poppins:Medium',sans-serif] leading-[22px] not-italic relative shrink-0 text-[#3279be] text-[12px]">INC-32</p>
    </div>
  );
}

function Frame59() {
  return (
    <div className="bg-[rgba(50,121,190,0.2)] content-stretch flex items-start px-[4px] relative rounded-[3px] shrink-0">
      <Frame41 />
    </div>
  );
}

function Frame42() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <p className="font-['Poppins:Medium',sans-serif] leading-[22px] not-italic relative shrink-0 text-[#3279be] text-[12px]">INC-31</p>
    </div>
  );
}

function Frame60() {
  return (
    <div className="bg-[rgba(50,121,190,0.2)] content-stretch flex items-start px-[4px] relative rounded-[3px] shrink-0">
      <Frame42 />
    </div>
  );
}

function Frame43() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <p className="font-['Poppins:Medium',sans-serif] leading-[22px] not-italic relative shrink-0 text-[#3279be] text-[12px]">INC-30</p>
    </div>
  );
}

function Frame61() {
  return (
    <div className="bg-[rgba(50,121,190,0.2)] content-stretch flex items-start px-[4px] relative rounded-[3px] shrink-0">
      <Frame43 />
    </div>
  );
}

function Frame44() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <p className="font-['Poppins:Medium',sans-serif] leading-[22px] not-italic relative shrink-0 text-[#3279be] text-[12px]">SR-87</p>
    </div>
  );
}

function Frame62() {
  return (
    <div className="bg-[rgba(50,121,190,0.2)] content-stretch flex items-start px-[4px] relative rounded-[3px] shrink-0">
      <Frame44 />
    </div>
  );
}

function Frame45() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <p className="font-['Poppins:Medium',sans-serif] leading-[22px] not-italic relative shrink-0 text-[#3279be] text-[12px]">SR-86</p>
    </div>
  );
}

function Frame63() {
  return (
    <div className="bg-[rgba(50,121,190,0.2)] content-stretch flex items-start px-[4px] relative rounded-[3px] shrink-0">
      <Frame45 />
    </div>
  );
}

function Frame46() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <p className="font-['Poppins:Medium',sans-serif] leading-[22px] not-italic relative shrink-0 text-[#3279be] text-[12px]">INC-29</p>
    </div>
  );
}

function Frame64() {
  return (
    <div className="bg-[rgba(50,121,190,0.2)] content-stretch flex items-start px-[4px] relative rounded-[3px] shrink-0">
      <Frame46 />
    </div>
  );
}

function Frame47() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <p className="font-['Poppins:Medium',sans-serif] leading-[22px] not-italic relative shrink-0 text-[#3279be] text-[12px]">SR-85</p>
    </div>
  );
}

function Frame65() {
  return (
    <div className="bg-[rgba(50,121,190,0.2)] content-stretch flex items-start px-[4px] relative rounded-[3px] shrink-0">
      <Frame47 />
    </div>
  );
}

function Frame48() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <p className="font-['Poppins:Medium',sans-serif] leading-[22px] not-italic relative shrink-0 text-[#3279be] text-[12px]">INC-28</p>
    </div>
  );
}

function Frame66() {
  return (
    <div className="bg-[rgba(50,121,190,0.2)] content-stretch flex items-start px-[4px] relative rounded-[3px] shrink-0">
      <Frame48 />
    </div>
  );
}

function Frame49() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <p className="font-['Poppins:Medium',sans-serif] leading-[22px] not-italic relative shrink-0 text-[#3279be] text-[12px]">SR-84</p>
    </div>
  );
}

function Frame67() {
  return (
    <div className="bg-[rgba(50,121,190,0.2)] content-stretch flex items-start px-[4px] relative rounded-[3px] shrink-0">
      <Frame49 />
    </div>
  );
}

function Frame50() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <p className="font-['Poppins:Medium',sans-serif] leading-[22px] not-italic relative shrink-0 text-[#3279be] text-[12px]">INC-27</p>
    </div>
  );
}

function Frame68() {
  return (
    <div className="bg-[rgba(50,121,190,0.2)] content-stretch flex items-start px-[4px] relative rounded-[3px] shrink-0">
      <Frame50 />
    </div>
  );
}

function Frame51() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <p className="font-['Poppins:Medium',sans-serif] leading-[22px] not-italic relative shrink-0 text-[#3279be] text-[12px]">SR-83</p>
    </div>
  );
}

function Frame69() {
  return (
    <div className="bg-[rgba(50,121,190,0.2)] content-stretch flex items-start px-[4px] relative rounded-[3px] shrink-0">
      <Frame51 />
    </div>
  );
}

function Frame52() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <p className="font-['Poppins:Medium',sans-serif] leading-[22px] not-italic relative shrink-0 text-[#3279be] text-[12px]">INC-26</p>
    </div>
  );
}

function Frame71() {
  return (
    <div className="bg-[rgba(50,121,190,0.2)] content-stretch flex items-start px-[4px] relative rounded-[3px] shrink-0">
      <Frame52 />
    </div>
  );
}

function Frame53() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <p className="font-['Poppins:Medium',sans-serif] leading-[22px] not-italic relative shrink-0 text-[#3279be] text-[12px]">SR-82</p>
    </div>
  );
}

function Frame73() {
  return (
    <div className="bg-[rgba(50,121,190,0.2)] content-stretch flex items-start px-[4px] relative rounded-[3px] shrink-0">
      <Frame53 />
    </div>
  );
}

function Frame75() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <p className="font-['Poppins:Medium',sans-serif] leading-[22px] not-italic relative shrink-0 text-[#3279be] text-[12px]">INC-25</p>
    </div>
  );
}

function Frame74() {
  return (
    <div className="bg-[rgba(50,121,190,0.2)] content-stretch flex items-start px-[4px] relative rounded-[3px] shrink-0">
      <Frame75 />
    </div>
  );
}

function Frame78() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <p className="font-['Poppins:Medium',sans-serif] leading-[22px] not-italic relative shrink-0 text-[#3279be] text-[12px]">SR-81</p>
    </div>
  );
}

function Frame76() {
  return (
    <div className="bg-[rgba(50,121,190,0.2)] content-stretch flex items-start px-[4px] relative rounded-[3px] shrink-0">
      <Frame78 />
    </div>
  );
}

function Frame80() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <p className="font-['Poppins:Medium',sans-serif] leading-[22px] not-italic relative shrink-0 text-[#3279be] text-[12px]">INC-24</p>
    </div>
  );
}

function Frame79() {
  return (
    <div className="bg-[rgba(50,121,190,0.2)] content-stretch flex items-start px-[4px] relative rounded-[3px] shrink-0">
      <Frame80 />
    </div>
  );
}

function Frame57() {
  return (
    <div className="col-1 content-stretch flex flex-col gap-[19px] items-start ml-0 mt-[33px] relative row-1">
      <Frame54 />
      <Frame55 />
      <Frame56 />
      <Frame58 />
      <Frame59 />
      <Frame60 />
      <Frame61 />
      <Frame62 />
      <Frame63 />
      <Frame64 />
      <Frame65 />
      <Frame66 />
      <Frame67 />
      <Frame68 />
      <Frame69 />
      <Frame71 />
      <Frame73 />
      <Frame74 />
      <Frame76 />
      <Frame79 />
    </div>
  );
}

function Group20() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <Group24 />
      <Frame57 />
    </div>
  );
}

function Frame27() {
  return (
    <div className="col-1 content-stretch flex gap-[4px] items-center ml-0 mt-0 relative row-1">
      <p className="font-['Poppins:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#364658] text-[12px]">Subject</p>
      <div className="h-[8px] relative shrink-0 w-[10.126px]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.1259 8">
          <path d={svgPaths.p33558000} fill="var(--fill-0, #364658)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function Group25() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-[0.12px] mt-0 place-items-start relative row-1">
      <Frame27 />
    </div>
  );
}

function Group29() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <Group25 />
      <div className="col-1 font-['Poppins:Medium',sans-serif] leading-[41px] ml-0 mt-[25px] not-italic relative row-1 text-[#3d8bd0] text-[12px] whitespace-nowrap">
        <p className="mb-0">Don’t just take our word for it-here’s what...</p>
        <p className="mb-0">Employee Onboarding</p>
        <p className="mb-0">Sify Internet Down</p>
        <p className="mb-0">Wifi is not working</p>
        <p className="mb-0">Employee Onboarding</p>
        <p className="mb-0">Laptop Charger not working</p>
        <p className="mb-0">Employee Onboarding</p>
        <p className="mb-0">help</p>
        <p className="mb-0">Employee Onboarding</p>
        <p className="mb-0">Sify Internet Down</p>
        <p className="mb-0">Wifi is not working</p>
        <p className="mb-0">Employee Onboarding</p>
        <p className="mb-0">Laptop Charger not working</p>
        <p className="mb-0">Employee Onboarding</p>
        <p className="mb-0">help</p>
        <p className="mb-0">Employee Onboarding</p>
        <p className="mb-0">Sify Internet Down</p>
        <p className="mb-0">Wifi is not working</p>
        <p className="mb-0">Employee Onboarding</p>
        <p>Laptop Charger not working</p>
      </div>
    </div>
  );
}

function Frame28() {
  return (
    <div className="col-1 content-stretch flex gap-[4px] items-center ml-0 mt-0 relative row-1">
      <p className="font-['Poppins:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#364658] text-[12px]">Requester</p>
      <div className="h-[8px] relative shrink-0 w-[10.126px]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <path d={svgPaths.p35b74300} fill="var(--fill-0, #364658)" id="Vector" opacity="0" />
        </svg>
      </div>
    </div>
  );
}

function Group22() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <Frame28 />
      <div className="col-1 font-['Poppins:Regular',sans-serif] leading-[41px] ml-0 mt-[24px] not-italic relative row-1 text-[#364658] text-[12px] whitespace-nowrap">
        <p className="mb-0">Manuel</p>
        <p className="mb-0">Manuel</p>
        <p className="mb-0">Prashant Pawshe</p>
        <p className="mb-0">Role Verification</p>
        <p className="mb-0">Aghillal MS</p>
        <p className="mb-0">Ashish</p>
        <p className="mb-0">Ashish</p>
        <p className="mb-0">Manuel</p>
        <p className="mb-0">Manuel</p>
        <p className="mb-0">Prashant Pawshe</p>
        <p className="mb-0">Role Verification</p>
        <p className="mb-0">Aghillal MS</p>
        <p className="mb-0">Ashish</p>
        <p className="mb-0">Ashish</p>
        <p className="mb-0">Manuel</p>
        <p className="mb-0">Manuel</p>
        <p className="mb-0">Prashant Pawshe</p>
        <p className="mb-0">Role Verification</p>
        <p className="mb-0">Aghillal MS</p>
        <p>Ashish</p>
      </div>
    </div>
  );
}

function Frame29() {
  return (
    <div className="col-1 content-stretch flex gap-[4px] items-center ml-0 mt-0 relative row-1">
      <p className="font-['Poppins:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#364658] text-[12px]">Due By Status</p>
      <div className="h-[8px] relative shrink-0 w-[10.126px]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <path d={svgPaths.p35b74300} fill="var(--fill-0, #364658)" id="Vector" opacity="0" />
        </svg>
      </div>
    </div>
  );
}

function Group26() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-[0.41px] mt-0 place-items-start relative row-1">
      <Frame29 />
    </div>
  );
}

function HourglassStartLight() {
  return (
    <div className="h-[12px] relative shrink-0 w-[9px]" data-name="hourglass-start-light 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 12">
        <g clipPath="url(#clip0_1_2995)" id="hourglass-start-light 1">
          <path d={svgPaths.p15b90740} fill="var(--fill-0, #364658)" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_1_2995">
            <rect fill="white" height="12" width="9" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame82() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <HourglassStartLight />
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#364658] text-[12px] text-center">{`3h 5m `}</p>
    </div>
  );
}

function HourglassStartLight1() {
  return (
    <div className="h-[12px] relative shrink-0 w-[9px]" data-name="hourglass-start-light 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 12">
        <g clipPath="url(#clip0_1_2995)" id="hourglass-start-light 1">
          <path d={svgPaths.p15b90740} fill="var(--fill-0, #364658)" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_1_2995">
            <rect fill="white" height="12" width="9" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame83() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <HourglassStartLight1 />
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#364658] text-[12px] text-center">{`14h 8m `}</p>
    </div>
  );
}

function HourglassStartLight2() {
  return (
    <div className="h-[12px] relative shrink-0 w-[9px]" data-name="hourglass-start-light 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 12">
        <g clipPath="url(#clip0_1_2995)" id="hourglass-start-light 1">
          <path d={svgPaths.p15b90740} fill="var(--fill-0, #364658)" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_1_2995">
            <rect fill="white" height="12" width="9" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame84() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <HourglassStartLight2 />
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#364658] text-[12px] text-center">{`12h 15m `}</p>
    </div>
  );
}

function HourglassStartLight3() {
  return (
    <div className="h-[12px] relative w-[9px]" data-name="hourglass-start-light 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 12">
        <g clipPath="url(#clip0_1_2946)" id="hourglass-start-light 1">
          <path d={svgPaths.p15b90740} fill="var(--fill-0, #F25C4E)" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_1_2946">
            <rect fill="white" height="12" width="9" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame85() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none">
          <HourglassStartLight3 />
        </div>
      </div>
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#f25c4e] text-[12px] text-center">{`16h 14m `}</p>
    </div>
  );
}

function HourglassStartLight4() {
  return (
    <div className="h-[12px] relative w-[9px]" data-name="hourglass-start-light 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 12">
        <g clipPath="url(#clip0_1_2943)" id="hourglass-start-light 1">
          <path d={svgPaths.p15b90740} fill="var(--fill-0, #A5BAD0)" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_1_2943">
            <rect fill="white" height="12" width="9" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame86() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none">
          <HourglassStartLight4 />
        </div>
      </div>
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#a5bad0] text-[12px] text-center">{`14h 15m `}</p>
    </div>
  );
}

function HourglassStartLight5() {
  return (
    <div className="h-[12px] relative w-[9px]" data-name="hourglass-start-light 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 12">
        <g clipPath="url(#clip0_1_2946)" id="hourglass-start-light 1">
          <path d={svgPaths.p15b90740} fill="var(--fill-0, #F25C4E)" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_1_2946">
            <rect fill="white" height="12" width="9" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame87() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none">
          <HourglassStartLight5 />
        </div>
      </div>
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#f25c4e] text-[12px] text-center">{`16h 14m `}</p>
    </div>
  );
}

function HourglassStartLight6() {
  return (
    <div className="h-[12px] relative w-[9px]" data-name="hourglass-start-light 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 12">
        <g clipPath="url(#clip0_1_2943)" id="hourglass-start-light 1">
          <path d={svgPaths.p15b90740} fill="var(--fill-0, #A5BAD0)" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_1_2943">
            <rect fill="white" height="12" width="9" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame88() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none">
          <HourglassStartLight6 />
        </div>
      </div>
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#a5bad0] text-[12px] text-center">{`12h 15m `}</p>
    </div>
  );
}

function HourglassStartLight7() {
  return (
    <div className="h-[12px] relative w-[9px]" data-name="hourglass-start-light 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 12">
        <g clipPath="url(#clip0_1_2943)" id="hourglass-start-light 1">
          <path d={svgPaths.p15b90740} fill="var(--fill-0, #A5BAD0)" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_1_2943">
            <rect fill="white" height="12" width="9" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame89() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none">
          <HourglassStartLight7 />
        </div>
      </div>
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#a5bad0] text-[12px] text-center">{`16h 15m `}</p>
    </div>
  );
}

function HourglassStartLight8() {
  return (
    <div className="h-[12px] relative w-[9px]" data-name="hourglass-start-light 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 12">
        <g clipPath="url(#clip0_1_2946)" id="hourglass-start-light 1">
          <path d={svgPaths.p15b90740} fill="var(--fill-0, #F25C4E)" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_1_2946">
            <rect fill="white" height="12" width="9" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame90() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none">
          <HourglassStartLight8 />
        </div>
      </div>
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#f25c4e] text-[12px] text-center">{`9h 22m `}</p>
    </div>
  );
}

function HourglassStartLight9() {
  return (
    <div className="h-[12px] relative w-[9px]" data-name="hourglass-start-light 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 12">
        <g clipPath="url(#clip0_1_2943)" id="hourglass-start-light 1">
          <path d={svgPaths.p15b90740} fill="var(--fill-0, #A5BAD0)" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_1_2943">
            <rect fill="white" height="12" width="9" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame91() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none">
          <HourglassStartLight9 />
        </div>
      </div>
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#a5bad0] text-[12px] text-center">{`16h 15m `}</p>
    </div>
  );
}

function HourglassStartLight10() {
  return (
    <div className="h-[12px] relative w-[9px]" data-name="hourglass-start-light 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 12">
        <g clipPath="url(#clip0_1_2937)" id="hourglass-start-light 1">
          <path d={svgPaths.p15b90740} fill="var(--fill-0, #364658)" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_1_2937">
            <rect fill="white" height="12" width="9" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame92() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none rotate-180">
          <HourglassStartLight10 />
        </div>
      </div>
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#364658] text-[12px] text-center">{`14h 5m `}</p>
    </div>
  );
}

function HourglassStartLight11() {
  return (
    <div className="h-[12px] relative w-[9px]" data-name="hourglass-start-light 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 12">
        <g clipPath="url(#clip0_1_2937)" id="hourglass-start-light 1">
          <path d={svgPaths.p15b90740} fill="var(--fill-0, #364658)" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_1_2937">
            <rect fill="white" height="12" width="9" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame93() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none rotate-180">
          <HourglassStartLight11 />
        </div>
      </div>
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#364658] text-[12px] text-center">{`22h 5m `}</p>
    </div>
  );
}

function HourglassStartLight12() {
  return (
    <div className="h-[12px] relative w-[9px]" data-name="hourglass-start-light 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 12">
        <g clipPath="url(#clip0_1_2937)" id="hourglass-start-light 1">
          <path d={svgPaths.p15b90740} fill="var(--fill-0, #364658)" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_1_2937">
            <rect fill="white" height="12" width="9" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame94() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none rotate-180">
          <HourglassStartLight12 />
        </div>
      </div>
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#364658] text-[12px] text-center">{`2d 13h 5m `}</p>
    </div>
  );
}

function HourglassStartLight13() {
  return (
    <div className="h-[12px] relative w-[9px]" data-name="hourglass-start-light 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 12">
        <g clipPath="url(#clip0_1_2937)" id="hourglass-start-light 1">
          <path d={svgPaths.p15b90740} fill="var(--fill-0, #364658)" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_1_2937">
            <rect fill="white" height="12" width="9" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame95() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none rotate-180">
          <HourglassStartLight13 />
        </div>
      </div>
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#364658] text-[12px] text-center">{`1d 3h 5m `}</p>
    </div>
  );
}

function HourglassStartLight14() {
  return (
    <div className="h-[12px] relative w-[9px]" data-name="hourglass-start-light 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 12">
        <g clipPath="url(#clip0_1_2946)" id="hourglass-start-light 1">
          <path d={svgPaths.p15b90740} fill="var(--fill-0, #F25C4E)" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_1_2946">
            <rect fill="white" height="12" width="9" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame96() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none">
          <HourglassStartLight14 />
        </div>
      </div>
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#f25c4e] text-[12px] text-center">{`9h 22m `}</p>
    </div>
  );
}

function HourglassStartLight15() {
  return (
    <div className="h-[12px] relative w-[9px]" data-name="hourglass-start-light 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 12">
        <g clipPath="url(#clip0_1_2943)" id="hourglass-start-light 1">
          <path d={svgPaths.p15b90740} fill="var(--fill-0, #A5BAD0)" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_1_2943">
            <rect fill="white" height="12" width="9" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame97() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none">
          <HourglassStartLight15 />
        </div>
      </div>
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#a5bad0] text-[12px] text-center">{`16h 15m `}</p>
    </div>
  );
}

function HourglassStartLight16() {
  return (
    <div className="h-[12px] relative w-[9px]" data-name="hourglass-start-light 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 12">
        <g clipPath="url(#clip0_1_2937)" id="hourglass-start-light 1">
          <path d={svgPaths.p15b90740} fill="var(--fill-0, #364658)" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_1_2937">
            <rect fill="white" height="12" width="9" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame98() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none rotate-180">
          <HourglassStartLight16 />
        </div>
      </div>
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#364658] text-[12px] text-center">{`14h 5m `}</p>
    </div>
  );
}

function HourglassStartLight17() {
  return (
    <div className="h-[12px] relative w-[9px]" data-name="hourglass-start-light 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 12">
        <g clipPath="url(#clip0_1_2937)" id="hourglass-start-light 1">
          <path d={svgPaths.p15b90740} fill="var(--fill-0, #364658)" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_1_2937">
            <rect fill="white" height="12" width="9" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame99() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none rotate-180">
          <HourglassStartLight17 />
        </div>
      </div>
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#364658] text-[12px] text-center">{`22h 5m `}</p>
    </div>
  );
}

function HourglassStartLight18() {
  return (
    <div className="h-[12px] relative w-[9px]" data-name="hourglass-start-light 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 12">
        <g clipPath="url(#clip0_1_2937)" id="hourglass-start-light 1">
          <path d={svgPaths.p15b90740} fill="var(--fill-0, #364658)" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_1_2937">
            <rect fill="white" height="12" width="9" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame100() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none rotate-180">
          <HourglassStartLight18 />
        </div>
      </div>
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#364658] text-[12px] text-center">{`2d 13h 5m `}</p>
    </div>
  );
}

function HourglassStartLight19() {
  return (
    <div className="h-[12px] relative w-[9px]" data-name="hourglass-start-light 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 12">
        <g clipPath="url(#clip0_1_2937)" id="hourglass-start-light 1">
          <path d={svgPaths.p15b90740} fill="var(--fill-0, #364658)" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_1_2937">
            <rect fill="white" height="12" width="9" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame101() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none rotate-180">
          <HourglassStartLight19 />
        </div>
      </div>
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#364658] text-[12px] text-center">{`1d 3h 5m `}</p>
    </div>
  );
}

function Frame81() {
  return (
    <div className="col-1 content-stretch flex flex-col gap-[23px] items-start ml-0 mt-[37px] relative row-1">
      <Frame82 />
      <Frame83 />
      <Frame84 />
      <Frame85 />
      <Frame86 />
      <Frame87 />
      <Frame88 />
      <Frame89 />
      <Frame90 />
      <Frame91 />
      <Frame92 />
      <Frame93 />
      <Frame94 />
      <Frame95 />
      <Frame96 />
      <Frame97 />
      <Frame98 />
      <Frame99 />
      <Frame100 />
      <Frame101 />
    </div>
  );
}

function Group23() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <Group26 />
      <Frame81 />
    </div>
  );
}

function Frame30() {
  return (
    <div className="col-1 content-stretch flex gap-[4px] items-center ml-0 mt-0 relative row-1">
      <p className="font-['Poppins:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#364658] text-[12px]">Due By</p>
      <div className="h-[8px] relative shrink-0 w-[10.126px]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <path d={svgPaths.p35b74300} fill="var(--fill-0, #364658)" id="Vector" opacity="0" />
        </svg>
      </div>
    </div>
  );
}

function Group28() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <Frame30 />
      <div className="col-1 font-['Poppins:Regular',sans-serif] leading-[41px] ml-0 mt-[24px] not-italic relative row-1 text-[#364658] text-[12px] whitespace-nowrap">
        <p className="mb-0">Wed, 22/12/2022 03:36 PM</p>
        <p className="mb-0">Tue, 22/12/2022 04:16 PM</p>
        <p className="mb-0">Tue, 22/12/2022 04:12 PM</p>
        <p className="mb-0">Tue, 22/12/2022 02:20 PM</p>
        <p className="mb-0">Mon, 24/12/2022 12:27 PM</p>
        <p className="mb-0">Mon, 24/12/2022 06:26 PM</p>
        <p className="mb-0">Thu, 25/12/2022 03:24 PM</p>
        <p className="mb-0">Wed, 25/12/2022 03:36 PM</p>
        <p className="mb-0">Tue, 26/12/2022 04:16 PM</p>
        <p className="mb-0">Tue, 26/12/2022 04:12 PM</p>
        <p className="mb-0">Tue, 27/12/2022 02:20 PM</p>
        <p className="mb-0">Mon, 27/12/2022 12:27 PM</p>
        <p className="mb-0">Mon, 28/12/2022 06:26 PM</p>
        <p className="mb-0">Thu, 28/12/2022 03:24 PM</p>
        <p className="mb-0">Tue, 26/12/2022 04:16 PM</p>
        <p className="mb-0">Tue, 26/12/2022 04:12 PM</p>
        <p className="mb-0">Tue, 27/12/2022 02:20 PM</p>
        <p className="mb-0">Mon, 27/12/2022 12:27 PM</p>
        <p className="mb-0">Mon, 28/12/2022 06:26 PM</p>
        <p>Thu, 28/12/2022 03:24 PM</p>
      </div>
    </div>
  );
}

function Frame32() {
  return (
    <div className="h-[8px] relative shrink-0 w-[10.126px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="Frame 65924" opacity="0">
          <path d={svgPaths.p35b74300} fill="var(--fill-0, #364658)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame31() {
  return (
    <div className="col-1 content-stretch flex gap-[4px] items-center ml-0 mt-0 relative row-1">
      <p className="font-['Poppins:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#364658] text-[12px]">Created Date</p>
      <Frame32 />
    </div>
  );
}

function Group27() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <Frame31 />
      <div className="col-1 font-['Poppins:Regular',sans-serif] leading-[41px] ml-0 mt-[24px] not-italic relative row-1 text-[#364658] text-[12px] whitespace-nowrap">
        <p className="mb-0">Wed, 20/12/2022 03:36 PM</p>
        <p className="mb-0">Tue, 20/12/2022 04:16 PM</p>
        <p className="mb-0">Tue, 20/12/2022 04:12 PM</p>
        <p className="mb-0">Tue, 20/12/2022 02:20 PM</p>
        <p className="mb-0">Mon, 22/12/2022 12:27 PM</p>
        <p className="mb-0">Mon, 22/12/2022 06:26 PM</p>
        <p className="mb-0">Thu, 23/12/2022 03:24 PM</p>
        <p className="mb-0">Wed, 23/12/2022 03:36 PM</p>
        <p className="mb-0">Tue, 24/12/2022 04:16 PM</p>
        <p className="mb-0">Tue, 24/12/2022 04:12 PM</p>
        <p className="mb-0">Tue, 25/12/2022 02:20 PM</p>
        <p className="mb-0">Mon, 25/12/2022 12:27 PM</p>
        <p className="mb-0">Mon, 26/12/2022 06:26 PM</p>
        <p className="mb-0">Thu, 26/12/2022 03:24 PM</p>
        <p className="mb-0">Tue, 24/12/2022 04:16 PM</p>
        <p className="mb-0">Tue, 24/12/2022 04:12 PM</p>
        <p className="mb-0">Tue, 25/12/2022 02:20 PM</p>
        <p className="mb-0">Mon, 25/12/2022 12:27 PM</p>
        <p className="mb-0">Mon, 26/12/2022 06:26 PM</p>
        <p>Thu, 26/12/2022 03:24 PM</p>
      </div>
    </div>
  );
}

function Frame33() {
  return (
    <div className="col-1 content-stretch flex gap-[4px] items-center ml-[6px] mt-0 relative row-1">
      <p className="font-['Poppins:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#364658] text-[12px]">Assigned to</p>
      <div className="h-[8px] relative shrink-0 w-[10.126px]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <path d={svgPaths.p35b74300} fill="var(--fill-0, #364658)" id="Vector" opacity="0" />
        </svg>
      </div>
    </div>
  );
}

function Group37() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="bg-[#3d8bd0] col-1 ml-0 mt-0 rounded-[4px] row-1 size-[20px]" />
      <p className="col-1 font-['Poppins:SemiBold',sans-serif] leading-[1.5] ml-[2.5px] mt-[2.5px] not-italic relative row-1 text-[10px] text-center text-white w-[15px] whitespace-pre-wrap">AD</p>
    </div>
  );
}

function ChevronDown1() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame148() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <p className="font-['Poppins:Regular',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#364658] text-[12px] text-center">Arnav Desai</p>
      <ChevronDown1 />
    </div>
  );
}

function AssigneGridDropdown() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Assigne Grid Dropdown">
      <Group37 />
      <Frame148 />
      <div className="absolute left-[21px] size-[8px] top-[2px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <circle cx="4" cy="4" fill="var(--fill-0, #89C540)" id="Ellipse 4208" r="4" />
        </svg>
      </div>
    </div>
  );
}

function Group38() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="bg-[#9b79b5] col-1 ml-0 mt-0 rounded-[4px] row-1 size-[20px]" />
      <p className="col-1 font-['Poppins:SemiBold',sans-serif] leading-[1.5] ml-[2.5px] mt-[2.5px] not-italic relative row-1 text-[10px] text-center text-white w-[15px] whitespace-pre-wrap">KZ</p>
    </div>
  );
}

function ChevronDown2() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame149() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <p className="font-['Poppins:Regular',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#364658] text-[12px] text-center">Keertan Zala</p>
      <ChevronDown2 />
    </div>
  );
}

function Component() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Component 73">
      <Group38 />
      <Frame149 />
      <div className="absolute left-[21px] size-[8px] top-[2px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <circle cx="4" cy="4" fill="var(--fill-0, #89C540)" id="Ellipse 4208" r="4" />
        </svg>
      </div>
    </div>
  );
}

function Group39() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="bg-[#bd9d39] col-1 ml-0 mt-0 rounded-[4px] row-1 size-[20px]" />
      <p className="col-1 font-['Poppins:SemiBold',sans-serif] leading-[1.5] ml-[2.5px] mt-[2.5px] not-italic relative row-1 text-[10px] text-center text-white w-[15px] whitespace-pre-wrap">SD</p>
    </div>
  );
}

function ChevronDown3() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="chevron-down">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame147() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <p className="font-['Poppins:Regular',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#364658] text-[12px] text-center">Shrenik Dalal</p>
      <ChevronDown3 />
    </div>
  );
}

function Component7() {
  return (
    <div className="bg-[#eef2f6] content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Component 85">
      <Group39 />
      <Frame147 />
      <div className="absolute left-[21px] size-[8px] top-[2px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <circle cx="4" cy="4" fill="var(--fill-0, #89C540)" id="Ellipse 4208" r="4" />
        </svg>
      </div>
    </div>
  );
}

function Group40() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="bg-[#b36f59] col-1 ml-0 mt-0 rounded-[4px] row-1 size-[20px]" />
      <p className="col-1 font-['Poppins:SemiBold',sans-serif] leading-[1.5] ml-[2.5px] mt-[2.5px] not-italic relative row-1 text-[10px] text-center text-white w-[15px] whitespace-pre-wrap">KP</p>
    </div>
  );
}

function ChevronDown4() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame150() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <p className="font-['Poppins:Regular',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#364658] text-[12px] text-center">Kishan Patel</p>
      <ChevronDown4 />
    </div>
  );
}

function Component11() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Component 90">
      <Group40 />
      <Frame150 />
      <div className="absolute left-[21px] size-[8px] top-[2px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <circle cx="4" cy="4" fill="var(--fill-0, #89C540)" id="Ellipse 4208" r="4" />
        </svg>
      </div>
    </div>
  );
}

function Group41() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="bg-[#3d8bd0] col-1 ml-0 mt-0 rounded-[4px] row-1 size-[20px]" />
      <p className="col-1 font-['Poppins:SemiBold',sans-serif] leading-[1.5] ml-[2.5px] mt-[2.5px] not-italic relative row-1 text-[10px] text-center text-white w-[15px] whitespace-pre-wrap">AD</p>
    </div>
  );
}

function ChevronDown5() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame151() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <p className="font-['Poppins:Regular',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#364658] text-[12px] text-center">Arnav Desai</p>
      <ChevronDown5 />
    </div>
  );
}

function Component10() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Component 89">
      <Group41 />
      <Frame151 />
      <div className="absolute left-[21px] size-[8px] top-[2px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <circle cx="4" cy="4" fill="var(--fill-0, #89C540)" id="Ellipse 4208" r="4" />
        </svg>
      </div>
    </div>
  );
}

function Group48() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="bg-[#9b79b5] col-1 ml-0 mt-0 rounded-[4px] row-1 size-[20px]" />
      <p className="col-1 font-['Poppins:SemiBold',sans-serif] leading-[1.5] ml-[2.5px] mt-[2.5px] not-italic relative row-1 text-[10px] text-center text-white w-[15px] whitespace-pre-wrap">KZ</p>
    </div>
  );
}

function ChevronDown6() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame152() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <p className="font-['Poppins:Regular',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#364658] text-[12px] text-center">Keertan Zala</p>
      <ChevronDown6 />
    </div>
  );
}

function Component12() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Component 92">
      <Group48 />
      <Frame152 />
      <div className="absolute left-[21px] size-[8px] top-[2px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <circle cx="4" cy="4" fill="var(--fill-0, #89C540)" id="Ellipse 4208" r="4" />
        </svg>
      </div>
    </div>
  );
}

function Group49() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="bg-[#c7566b] col-1 ml-0 mt-0 rounded-[4px] row-1 size-[20px]" />
      <p className="col-1 font-['Poppins:SemiBold',sans-serif] leading-[1.5] ml-[2.5px] mt-[2.5px] not-italic relative row-1 text-[10px] text-center text-white w-[15px] whitespace-pre-wrap">RP</p>
    </div>
  );
}

function ChevronDown7() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame153() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <p className="font-['Poppins:Regular',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#364658] text-[12px] text-center">Ronak Patel</p>
      <ChevronDown7 />
    </div>
  );
}

function Component3() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Component 79">
      <Group49 />
      <Frame153 />
      <div className="absolute left-[21px] size-[8px] top-[2px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <circle cx="4" cy="4" fill="var(--fill-0, #89C540)" id="Ellipse 4208" r="4" />
        </svg>
      </div>
    </div>
  );
}

function Group50() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="bg-[#3d8bd0] col-1 ml-0 mt-0 rounded-[4px] row-1 size-[20px]" />
      <p className="col-1 font-['Poppins:SemiBold',sans-serif] leading-[1.5] ml-[2.5px] mt-[2.5px] not-italic relative row-1 text-[10px] text-center text-white w-[15px] whitespace-pre-wrap">AD</p>
    </div>
  );
}

function ChevronDown8() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame154() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <p className="font-['Poppins:Regular',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#364658] text-[12px] text-center">Arnav Desai</p>
      <ChevronDown8 />
    </div>
  );
}

function Component4() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Component 80">
      <Group50 />
      <Frame154 />
      <div className="absolute left-[21px] size-[8px] top-[2px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <circle cx="4" cy="4" fill="var(--fill-0, #89C540)" id="Ellipse 4208" r="4" />
        </svg>
      </div>
    </div>
  );
}

function Group51() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="bg-[#b36f59] col-1 ml-0 mt-0 rounded-[4px] row-1 size-[20px]" />
      <p className="col-1 font-['Poppins:SemiBold',sans-serif] leading-[1.5] ml-[2.5px] mt-[2.5px] not-italic relative row-1 text-[10px] text-center text-white w-[15px] whitespace-pre-wrap">KP</p>
    </div>
  );
}

function ChevronDown9() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame155() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <p className="font-['Poppins:Regular',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#364658] text-[12px] text-center">Kishan Patel</p>
      <ChevronDown9 />
    </div>
  );
}

function Component18() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Component 98">
      <Group51 />
      <Frame155 />
      <div className="absolute left-[21px] size-[8px] top-[2px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <circle cx="4" cy="4" fill="var(--fill-0, #89C540)" id="Ellipse 4208" r="4" />
        </svg>
      </div>
    </div>
  );
}

function Group52() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="bg-[#43783c] col-1 ml-0 mt-0 rounded-[4px] row-1 size-[20px]" />
      <p className="col-1 font-['Poppins:SemiBold',sans-serif] leading-[1.5] ml-[2.5px] mt-[2.5px] not-italic relative row-1 text-[10px] text-center text-white w-[15px] whitespace-pre-wrap">PP</p>
    </div>
  );
}

function ChevronDown10() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame156() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <p className="font-['Poppins:Regular',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#364658] text-[12px] text-center">Pratik Patel</p>
      <ChevronDown10 />
    </div>
  );
}

function Component6() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Component 84">
      <Group52 />
      <Frame156 />
      <div className="absolute left-[21px] size-[8px] top-[2px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <circle cx="4" cy="4" fill="var(--fill-0, #89C540)" id="Ellipse 4208" r="4" />
        </svg>
      </div>
    </div>
  );
}

function Group53() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="bg-[#3d8bd0] col-1 ml-0 mt-0 rounded-[4px] row-1 size-[20px]" />
      <p className="col-1 font-['Poppins:SemiBold',sans-serif] leading-[1.5] ml-[2.5px] mt-[2.5px] not-italic relative row-1 text-[10px] text-center text-white w-[15px] whitespace-pre-wrap">AD</p>
    </div>
  );
}

function ChevronDown11() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame157() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <p className="font-['Poppins:Regular',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#364658] text-[12px] text-center">Arnav Desai</p>
      <ChevronDown11 />
    </div>
  );
}

function Component9() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Component 88">
      <Group53 />
      <Frame157 />
      <div className="absolute left-[21px] size-[8px] top-[2px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <circle cx="4" cy="4" fill="var(--fill-0, #89C540)" id="Ellipse 4208" r="4" />
        </svg>
      </div>
    </div>
  );
}

function Group54() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="bg-[#bd9d39] col-1 ml-0 mt-0 rounded-[4px] row-1 size-[20px]" />
      <p className="col-1 font-['Poppins:SemiBold',sans-serif] leading-[1.5] ml-[2.5px] mt-[2.5px] not-italic relative row-1 text-[10px] text-center text-white w-[15px] whitespace-pre-wrap">SD</p>
    </div>
  );
}

function ChevronDown12() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame158() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <p className="font-['Poppins:Regular',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#364658] text-[12px] text-center">Shrenik Dalal</p>
      <ChevronDown12 />
    </div>
  );
}

function Component15() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Component 95">
      <Group54 />
      <Frame158 />
      <div className="absolute left-[21px] size-[8px] top-[2px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <circle cx="4" cy="4" fill="var(--fill-0, #89C540)" id="Ellipse 4208" r="4" />
        </svg>
      </div>
    </div>
  );
}

function Group55() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="bg-[#239fad] col-1 ml-0 mt-0 rounded-[4px] row-1 size-[20px]" />
      <p className="col-1 font-['Poppins:SemiBold',sans-serif] leading-[1.5] ml-[2.5px] mt-[2.5px] not-italic relative row-1 text-[10px] text-center text-white w-[15px] whitespace-pre-wrap">RS</p>
    </div>
  );
}

function ChevronDown13() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame159() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <p className="font-['Poppins:Regular',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#364658] text-[12px] text-center">Rahul Shukla</p>
      <ChevronDown13 />
    </div>
  );
}

function Component2() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Component 76">
      <Group55 />
      <Frame159 />
      <div className="absolute left-[21px] size-[8px] top-[2px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <circle cx="4" cy="4" fill="var(--fill-0, #89C540)" id="Ellipse 4208" r="4" />
        </svg>
      </div>
    </div>
  );
}

function Group56() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="bg-[#9b79b5] col-1 ml-0 mt-0 rounded-[4px] row-1 size-[20px]" />
      <p className="col-1 font-['Poppins:SemiBold',sans-serif] leading-[1.5] ml-[2.5px] mt-[2.5px] not-italic relative row-1 text-[10px] text-center text-white w-[15px] whitespace-pre-wrap">KZ</p>
    </div>
  );
}

function ChevronDown14() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame160() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <p className="font-['Poppins:Regular',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#364658] text-[12px] text-center">Keertan Zala</p>
      <ChevronDown14 />
    </div>
  );
}

function Component13() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Component 93">
      <Group56 />
      <Frame160 />
      <div className="absolute left-[21px] size-[8px] top-[2px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <circle cx="4" cy="4" fill="var(--fill-0, #89C540)" id="Ellipse 4208" r="4" />
        </svg>
      </div>
    </div>
  );
}

function Group57() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="bg-[#3d8bd0] col-1 ml-0 mt-0 rounded-[4px] row-1 size-[20px]" />
      <p className="col-1 font-['Poppins:SemiBold',sans-serif] leading-[1.5] ml-[2.5px] mt-[2.5px] not-italic relative row-1 text-[10px] text-center text-white w-[15px] whitespace-pre-wrap">AD</p>
    </div>
  );
}

function ChevronDown15() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame161() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <p className="font-['Poppins:Regular',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#364658] text-[12px] text-center">Arnav Desai</p>
      <ChevronDown15 />
    </div>
  );
}

function Component5() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Component 83">
      <Group57 />
      <Frame161 />
      <div className="absolute left-[21px] size-[8px] top-[2px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <circle cx="4" cy="4" fill="var(--fill-0, #89C540)" id="Ellipse 4208" r="4" />
        </svg>
      </div>
    </div>
  );
}

function Group58() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="bg-[#bd9d39] col-1 ml-0 mt-0 rounded-[4px] row-1 size-[20px]" />
      <p className="col-1 font-['Poppins:SemiBold',sans-serif] leading-[1.5] ml-[2.5px] mt-[2.5px] not-italic relative row-1 text-[10px] text-center text-white w-[15px] whitespace-pre-wrap">SD</p>
    </div>
  );
}

function ChevronDown16() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame162() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <p className="font-['Poppins:Regular',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#364658] text-[12px] text-center">Shrenik Dalal</p>
      <ChevronDown16 />
    </div>
  );
}

function Component16() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Component 96">
      <Group58 />
      <Frame162 />
      <div className="absolute left-[21px] size-[8px] top-[2px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <circle cx="4" cy="4" fill="var(--fill-0, #89C540)" id="Ellipse 4208" r="4" />
        </svg>
      </div>
    </div>
  );
}

function Group59() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="bg-[#3d8bd0] col-1 ml-0 mt-0 rounded-[4px] row-1 size-[20px]" />
      <p className="col-1 font-['Poppins:SemiBold',sans-serif] leading-[1.5] ml-[2.5px] mt-[2.5px] not-italic relative row-1 text-[10px] text-center text-white w-[15px] whitespace-pre-wrap">AD</p>
    </div>
  );
}

function ChevronDown17() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame163() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <p className="font-['Poppins:Regular',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#364658] text-[12px] text-center">Arnav Desai</p>
      <ChevronDown17 />
    </div>
  );
}

function Component1() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Component 75">
      <Group59 />
      <Frame163 />
      <div className="absolute left-[21px] size-[8px] top-[2px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <circle cx="4" cy="4" fill="var(--fill-0, #89C540)" id="Ellipse 4208" r="4" />
        </svg>
      </div>
    </div>
  );
}

function Group60() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="bg-[#c7566b] col-1 ml-0 mt-0 rounded-[4px] row-1 size-[20px]" />
      <p className="col-1 font-['Poppins:SemiBold',sans-serif] leading-[1.5] ml-[2.5px] mt-[2.5px] not-italic relative row-1 text-[10px] text-center text-white w-[15px] whitespace-pre-wrap">RP</p>
    </div>
  );
}

function ChevronDown18() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame164() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <p className="font-['Poppins:Regular',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#364658] text-[12px] text-center">Ronak Patel</p>
      <ChevronDown18 />
    </div>
  );
}

function Component17() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Component 97">
      <Group60 />
      <Frame164 />
      <div className="absolute left-[21px] size-[8px] top-[2px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <circle cx="4" cy="4" fill="var(--fill-0, #89C540)" id="Ellipse 4208" r="4" />
        </svg>
      </div>
    </div>
  );
}

function Group61() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="bg-[#9b79b5] col-1 ml-0 mt-0 rounded-[4px] row-1 size-[20px]" />
      <p className="col-1 font-['Poppins:SemiBold',sans-serif] leading-[1.5] ml-[2.5px] mt-[2.5px] not-italic relative row-1 text-[10px] text-center text-white w-[15px] whitespace-pre-wrap">KZ</p>
    </div>
  );
}

function ChevronDown19() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame165() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <p className="font-['Poppins:Regular',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#364658] text-[12px] text-center">Keertan Zala</p>
      <ChevronDown19 />
    </div>
  );
}

function Component14() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Component 94">
      <Group61 />
      <Frame165 />
      <div className="absolute left-[21px] size-[8px] top-[2px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <circle cx="4" cy="4" fill="var(--fill-0, #89C540)" id="Ellipse 4208" r="4" />
        </svg>
      </div>
    </div>
  );
}

function Group62() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="bg-[#3d8bd0] col-1 ml-0 mt-0 rounded-[4px] row-1 size-[20px]" />
      <p className="col-1 font-['Poppins:SemiBold',sans-serif] leading-[1.5] ml-[2.5px] mt-[2.5px] not-italic relative row-1 text-[10px] text-center text-white w-[15px] whitespace-pre-wrap">AD</p>
    </div>
  );
}

function ChevronDown20() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame166() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <p className="font-['Poppins:Regular',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#364658] text-[12px] text-center">Arnav Desai</p>
      <ChevronDown20 />
    </div>
  );
}

function Component8() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Component 87">
      <Group62 />
      <Frame166 />
      <div className="absolute left-[21px] size-[8px] top-[2px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <circle cx="4" cy="4" fill="var(--fill-0, #89C540)" id="Ellipse 4208" r="4" />
        </svg>
      </div>
    </div>
  );
}

function Frame34() {
  return (
    <div className="col-1 content-stretch flex flex-col gap-[13px] items-start ml-0 mt-[31px] relative row-1">
      <AssigneGridDropdown />
      <Component />
      <Component7 />
      <Component11 />
      <Component10 />
      <Component12 />
      <Component3 />
      <Component4 />
      <Component18 />
      <Component6 />
      <Component9 />
      <Component15 />
      <Component2 />
      <Component13 />
      <Component5 />
      <Component16 />
      <Component1 />
      <Component17 />
      <Component14 />
      <Component8 />
    </div>
  );
}

function Group30() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <Frame33 />
      <Frame34 />
    </div>
  );
}

function Frame35() {
  return (
    <div className="col-1 content-stretch flex gap-[4px] items-center ml-[7px] mt-0 relative row-1">
      <p className="font-['Poppins:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#364658] text-[12px]">Status</p>
      <div className="h-[8px] relative shrink-0 w-[10.126px]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <path d={svgPaths.p35b74300} fill="var(--fill-0, #364658)" id="Vector" opacity="0" />
        </svg>
      </div>
    </div>
  );
}

function OpenStatus() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Open-status">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Open-status">
          <circle cx="6" cy="6" id="Ellipse 4206" r="5.5" stroke="var(--stroke-0, #A5BAD0)" />
        </g>
      </svg>
    </div>
  );
}

function Frame105() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <OpenStatus />
      <p className="font-['Poppins:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#364658] text-[12px]">Open</p>
    </div>
  );
}

function ChevronDown21() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame167() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <ChevronDown21 />
    </div>
  );
}

function StatusDropdown() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Status dropdown">
      <Frame105 />
      <Frame167 />
    </div>
  );
}

function OpenStatus1() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Open-status">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Open-status">
          <circle cx="6" cy="6" fill="var(--fill-0, #3D8BD0)" id="Ellipse 4206" r="6" />
        </g>
      </svg>
    </div>
  );
}

function Frame106() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <OpenStatus1 />
      <p className="font-['Poppins:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#364658] text-[12px]">In Progress</p>
    </div>
  );
}

function ChevronDown22() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame168() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <ChevronDown22 />
    </div>
  );
}

function StatusDropdown1() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Status dropdown">
      <Frame106 />
      <Frame168 />
    </div>
  );
}

function OpenStatus2() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Open-status">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Open-status">
          <circle cx="6" cy="6" fill="var(--fill-0, #F58518)" id="Ellipse 4206" r="6" />
        </g>
      </svg>
    </div>
  );
}

function Frame107() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <OpenStatus2 />
      <p className="font-['Poppins:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#364658] text-[12px]">Pending</p>
    </div>
  );
}

function ChevronDown23() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="chevron-down">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame169() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <ChevronDown23 />
    </div>
  );
}

function StatusDropdown2() {
  return (
    <div className="bg-[#eef2f6] content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Status dropdown">
      <Frame107 />
      <Frame169 />
    </div>
  );
}

function OpenStatus3() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Open-status">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Open-status">
          <circle cx="6" cy="6" fill="var(--fill-0, #3D8BD0)" id="Ellipse 4206" r="6" />
        </g>
      </svg>
    </div>
  );
}

function Frame108() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <OpenStatus3 />
      <p className="font-['Poppins:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#364658] text-[12px]">In Progress</p>
    </div>
  );
}

function ChevronDown24() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame170() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <ChevronDown24 />
    </div>
  );
}

function StatusDropdown3() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Status dropdown">
      <Frame108 />
      <Frame170 />
    </div>
  );
}

function OpenStatus4() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Open-status">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Open-status">
          <circle cx="6" cy="6" fill="var(--fill-0, #89C540)" id="Ellipse 4206" r="6" />
        </g>
      </svg>
    </div>
  );
}

function Frame109() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <OpenStatus4 />
      <p className="font-['Poppins:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#364658] text-[12px]">Completed</p>
    </div>
  );
}

function ChevronDown25() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame171() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <ChevronDown25 />
    </div>
  );
}

function StatusDropdown4() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Status dropdown">
      <Frame109 />
      <Frame171 />
    </div>
  );
}

function OpenStatus5() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Open-status">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Open-status">
          <circle cx="6" cy="6" fill="var(--fill-0, #3D8BD0)" id="Ellipse 4206" r="6" />
        </g>
      </svg>
    </div>
  );
}

function Frame110() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <OpenStatus5 />
      <p className="font-['Poppins:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#364658] text-[12px]">In Progress</p>
    </div>
  );
}

function ChevronDown26() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame172() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <ChevronDown26 />
    </div>
  );
}

function StatusDropdown5() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Status dropdown">
      <Frame110 />
      <Frame172 />
    </div>
  );
}

function OpenStatus6() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Open-status">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Open-status">
          <circle cx="6" cy="6" fill="var(--fill-0, #89C540)" id="Ellipse 4206" r="6" />
        </g>
      </svg>
    </div>
  );
}

function Frame111() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <OpenStatus6 />
      <p className="font-['Poppins:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#364658] text-[12px]">Completed</p>
    </div>
  );
}

function ChevronDown27() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame173() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <ChevronDown27 />
    </div>
  );
}

function StatusDropdown6() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Status dropdown">
      <Frame111 />
      <Frame173 />
    </div>
  );
}

function OpenStatus7() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Open-status">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Open-status">
          <circle cx="6" cy="6" fill="var(--fill-0, #89C540)" id="Ellipse 4206" r="6" />
        </g>
      </svg>
    </div>
  );
}

function Frame112() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <OpenStatus7 />
      <p className="font-['Poppins:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#364658] text-[12px]">Completed</p>
    </div>
  );
}

function ChevronDown28() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame174() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <ChevronDown28 />
    </div>
  );
}

function StatusDropdown7() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Status dropdown">
      <Frame112 />
      <Frame174 />
    </div>
  );
}

function OpenStatus8() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Open-status">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Open-status">
          <circle cx="6" cy="6" fill="var(--fill-0, #3D8BD0)" id="Ellipse 4206" r="6" />
        </g>
      </svg>
    </div>
  );
}

function Frame113() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <OpenStatus8 />
      <p className="font-['Poppins:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#364658] text-[12px]">In Progress</p>
    </div>
  );
}

function ChevronDown29() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame175() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <ChevronDown29 />
    </div>
  );
}

function StatusDropdown8() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Status dropdown">
      <Frame113 />
      <Frame175 />
    </div>
  );
}

function ClosedStatus() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Closed Status">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Closed Status">
          <path d={svgPaths.p31e74600} fill="var(--fill-0, #7B8FA5)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame114() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <ClosedStatus />
      <p className="font-['Poppins:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#364658] text-[12px]">Closed</p>
    </div>
  );
}

function ChevronDown30() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame176() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <ChevronDown30 />
    </div>
  );
}

function StatusDropdown9() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Status dropdown">
      <Frame114 />
      <Frame176 />
    </div>
  );
}

function OpenStatus9() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Open-status">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Open-status">
          <circle cx="6" cy="6" fill="var(--fill-0, #F25C4E)" id="Ellipse 4206" r="6" />
        </g>
      </svg>
    </div>
  );
}

function Frame115() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <OpenStatus9 />
      <p className="font-['Poppins:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#364658] text-[12px]">Cancelled</p>
    </div>
  );
}

function ChevronDown31() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame177() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <ChevronDown31 />
    </div>
  );
}

function StatusDropdown10() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Status dropdown">
      <Frame115 />
      <Frame177 />
    </div>
  );
}

function OpenStatus10() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Open-status">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Open-status">
          <circle cx="6" cy="6" fill="var(--fill-0, #F58518)" id="Ellipse 4206" r="6" />
        </g>
      </svg>
    </div>
  );
}

function Frame116() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <OpenStatus10 />
      <p className="font-['Poppins:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#364658] text-[12px]">Pending</p>
    </div>
  );
}

function ChevronDown32() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame178() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <ChevronDown32 />
    </div>
  );
}

function StatusDropdown11() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Status dropdown">
      <Frame116 />
      <Frame178 />
    </div>
  );
}

function OpenStatus11() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Open-status">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Open-status">
          <circle cx="6" cy="6" fill="var(--fill-0, #3D8BD0)" id="Ellipse 4206" r="6" />
        </g>
      </svg>
    </div>
  );
}

function Frame117() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <OpenStatus11 />
      <p className="font-['Poppins:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#364658] text-[12px]">In Progress</p>
    </div>
  );
}

function ChevronDown33() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame179() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <ChevronDown33 />
    </div>
  );
}

function StatusDropdown12() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Status dropdown">
      <Frame117 />
      <Frame179 />
    </div>
  );
}

function OpenStatus12() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Open-status">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Open-status">
          <circle cx="6" cy="6" fill="var(--fill-0, #3D8BD0)" id="Ellipse 4206" r="6" />
        </g>
      </svg>
    </div>
  );
}

function Frame118() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <OpenStatus12 />
      <p className="font-['Poppins:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#364658] text-[12px]">In Progress</p>
    </div>
  );
}

function ChevronDown34() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame180() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <ChevronDown34 />
    </div>
  );
}

function StatusDropdown13() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Status dropdown">
      <Frame118 />
      <Frame180 />
    </div>
  );
}

function OpenStatus13() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Open-status">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Open-status">
          <circle cx="6" cy="6" fill="var(--fill-0, #F58518)" id="Ellipse 4206" r="6" />
        </g>
      </svg>
    </div>
  );
}

function Frame119() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <OpenStatus13 />
      <p className="font-['Poppins:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#364658] text-[12px]">Pending</p>
    </div>
  );
}

function ChevronDown35() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame181() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <ChevronDown35 />
    </div>
  );
}

function StatusDropdown14() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Status dropdown">
      <Frame119 />
      <Frame181 />
    </div>
  );
}

function OpenStatus14() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Open-status">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Open-status">
          <circle cx="6" cy="6" fill="var(--fill-0, #89C540)" id="Ellipse 4206" r="6" />
        </g>
      </svg>
    </div>
  );
}

function Frame120() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <OpenStatus14 />
      <p className="font-['Poppins:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#364658] text-[12px]">Completed</p>
    </div>
  );
}

function ChevronDown36() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame182() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <ChevronDown36 />
    </div>
  );
}

function StatusDropdown15() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Status dropdown">
      <Frame120 />
      <Frame182 />
    </div>
  );
}

function OpenStatus15() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Open-status">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Open-status">
          <circle cx="6" cy="6" fill="var(--fill-0, #F25C4E)" id="Ellipse 4206" r="6" />
        </g>
      </svg>
    </div>
  );
}

function Frame121() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <OpenStatus15 />
      <p className="font-['Poppins:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#364658] text-[12px]">Cancelled</p>
    </div>
  );
}

function ChevronDown37() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame183() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <ChevronDown37 />
    </div>
  );
}

function StatusDropdown16() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Status dropdown">
      <Frame121 />
      <Frame183 />
    </div>
  );
}

function OpenStatus16() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Open-status">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Open-status">
          <circle cx="6" cy="6" fill="var(--fill-0, #3D8BD0)" id="Ellipse 4206" r="6" />
        </g>
      </svg>
    </div>
  );
}

function Frame122() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <OpenStatus16 />
      <p className="font-['Poppins:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#364658] text-[12px]">In Progress</p>
    </div>
  );
}

function ChevronDown38() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame184() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <ChevronDown38 />
    </div>
  );
}

function StatusDropdown17() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Status dropdown">
      <Frame122 />
      <Frame184 />
    </div>
  );
}

function OpenStatus17() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Open-status">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Open-status">
          <circle cx="6" cy="6" fill="var(--fill-0, #3D8BD0)" id="Ellipse 4206" r="6" />
        </g>
      </svg>
    </div>
  );
}

function Frame123() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <OpenStatus17 />
      <p className="font-['Poppins:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#364658] text-[12px]">In Progress</p>
    </div>
  );
}

function ChevronDown39() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame185() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <ChevronDown39 />
    </div>
  );
}

function StatusDropdown18() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Status dropdown">
      <Frame123 />
      <Frame185 />
    </div>
  );
}

function OpenStatus18() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Open-status">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Open-status">
          <circle cx="6" cy="6" id="Ellipse 4206" r="5.5" stroke="var(--stroke-0, #A5BAD0)" />
        </g>
      </svg>
    </div>
  );
}

function Frame124() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <OpenStatus18 />
      <p className="font-['Poppins:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#364658] text-[12px]">Open</p>
    </div>
  );
}

function ChevronDown40() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame186() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <ChevronDown40 />
    </div>
  );
}

function StatusDropdown19() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Status dropdown">
      <Frame124 />
      <Frame186 />
    </div>
  );
}

function Frame4() {
  return (
    <div className="col-1 content-stretch flex flex-col gap-[13px] items-start ml-0 mt-0 relative row-1">
      <StatusDropdown />
      <StatusDropdown1 />
      <StatusDropdown2 />
      <StatusDropdown3 />
      <StatusDropdown4 />
      <StatusDropdown5 />
      <StatusDropdown6 />
      <StatusDropdown7 />
      <StatusDropdown8 />
      <StatusDropdown9 />
      <StatusDropdown10 />
      <StatusDropdown11 />
      <StatusDropdown12 />
      <StatusDropdown13 />
      <StatusDropdown14 />
      <StatusDropdown15 />
      <StatusDropdown16 />
      <StatusDropdown17 />
      <StatusDropdown18 />
      <StatusDropdown19 />
    </div>
  );
}

function Group11() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-[31px] place-items-start relative row-1">
      <Frame4 />
    </div>
  );
}

function Group31() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <Frame35 />
      <Group11 />
    </div>
  );
}

function Frame36() {
  return (
    <div className="col-1 content-stretch flex gap-[4px] items-center ml-[7px] mt-0 relative row-1">
      <p className="font-['Poppins:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#364658] text-[12px]">Priority</p>
      <div className="h-[8px] relative shrink-0 w-[10.126px]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <path d={svgPaths.p35b74300} fill="var(--fill-0, #364658)" id="Vector" opacity="0" />
        </svg>
      </div>
    </div>
  );
}

function Group63() {
  return (
    <div className="absolute contents inset-[7.14%_0]">
      <div className="absolute bg-[#89c540] inset-[71.43%_85.71%_7.14%_0] rounded-[1px]" />
      <div className="absolute bg-[#a5bad0] bottom-[7.14%] left-[28.57%] right-[57.14%] rounded-[1px] top-1/2" />
      <div className="absolute bg-[#a5bad0] inset-[28.57%_28.57%_7.14%_57.14%] rounded-[1px]" />
      <div className="absolute bg-[#a5bad0] inset-[7.14%_0_7.14%_85.71%] rounded-[1px]" />
    </div>
  );
}

function Frame203() {
  return (
    <div className="relative shrink-0 size-[14px]">
      <Group63 />
    </div>
  );
}

function Low() {
  return (
    <div className="content-stretch flex h-[14px] items-end relative shrink-0" data-name="Low">
      <Frame203 />
    </div>
  );
}

function Frame125() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <Low />
      <p className="font-['Poppins:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#364658] text-[12px]">Low</p>
    </div>
  );
}

function ChevronDown41() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame187() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <ChevronDown41 />
    </div>
  );
}

function IconDropdwon() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Icon Dropdwon">
      <Frame125 />
      <Frame187 />
    </div>
  );
}

function Group64() {
  return (
    <div className="absolute contents inset-[7.14%_0]">
      <div className="absolute bg-[#89c540] inset-[71.43%_85.71%_7.14%_0] rounded-[1px]" />
      <div className="absolute bg-[#a5bad0] bottom-[7.14%] left-[28.57%] right-[57.14%] rounded-[1px] top-1/2" />
      <div className="absolute bg-[#a5bad0] inset-[28.57%_28.57%_7.14%_57.14%] rounded-[1px]" />
      <div className="absolute bg-[#a5bad0] inset-[7.14%_0_7.14%_85.71%] rounded-[1px]" />
    </div>
  );
}

function Frame204() {
  return (
    <div className="relative shrink-0 size-[14px]">
      <Group64 />
    </div>
  );
}

function Low1() {
  return (
    <div className="content-stretch flex h-[14px] items-end relative shrink-0" data-name="Low">
      <Frame204 />
    </div>
  );
}

function Frame126() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <Low1 />
      <p className="font-['Poppins:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#364658] text-[12px]">Low</p>
    </div>
  );
}

function ChevronDown42() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame188() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <ChevronDown42 />
    </div>
  );
}

function IconDropdwon1() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Icon Dropdwon">
      <Frame126 />
      <Frame188 />
    </div>
  );
}

function Group65() {
  return (
    <div className="absolute contents inset-[7.14%_0]">
      <div className="absolute bg-[#89c540] inset-[71.43%_85.71%_7.14%_0] rounded-[1px]" />
      <div className="absolute bg-[#a5bad0] bottom-[7.14%] left-[28.57%] right-[57.14%] rounded-[1px] top-1/2" />
      <div className="absolute bg-[#a5bad0] inset-[28.57%_28.57%_7.14%_57.14%] rounded-[1px]" />
      <div className="absolute bg-[#a5bad0] inset-[7.14%_0_7.14%_85.71%] rounded-[1px]" />
    </div>
  );
}

function Frame205() {
  return (
    <div className="relative shrink-0 size-[14px]">
      <Group65 />
    </div>
  );
}

function Low2() {
  return (
    <div className="content-stretch flex h-[14px] items-end relative shrink-0" data-name="Low">
      <Frame205 />
    </div>
  );
}

function Frame127() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <Low2 />
      <p className="font-['Poppins:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#364658] text-[12px]">Low</p>
    </div>
  );
}

function ChevronDown43() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="chevron-down">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame189() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <ChevronDown43 />
    </div>
  );
}

function IconDropdwon2() {
  return (
    <div className="bg-[#eef2f6] content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Icon Dropdwon">
      <Frame127 />
      <Frame189 />
    </div>
  );
}

function Group67() {
  return (
    <div className="absolute contents inset-[7.14%_0]">
      <div className="absolute bg-[#f58518] inset-[71.43%_85.71%_7.14%_0] rounded-[1px]" />
      <div className="absolute bg-[#f58518] bottom-[7.14%] left-[28.57%] right-[57.14%] rounded-[1px] top-1/2" />
      <div className="absolute bg-[#f58518] inset-[28.57%_28.57%_7.14%_57.14%] rounded-[1px]" />
      <div className="absolute bg-[#a5bad0] inset-[7.14%_0_7.14%_85.71%] rounded-[1px]" />
    </div>
  );
}

function Frame206() {
  return (
    <div className="relative shrink-0 size-[14px]">
      <Group67 />
    </div>
  );
}

function High() {
  return (
    <div className="content-stretch flex items-end relative shrink-0 size-[14px]" data-name="High">
      <Frame206 />
    </div>
  );
}

function Frame128() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <High />
      <p className="font-['Poppins:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#364658] text-[12px]">High</p>
    </div>
  );
}

function ChevronDown44() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame190() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <ChevronDown44 />
    </div>
  );
}

function IconDropdwon3() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Icon Dropdwon">
      <Frame128 />
      <Frame190 />
    </div>
  );
}

function Group68() {
  return (
    <div className="absolute contents inset-[7.14%_0]">
      <div className="absolute bg-[#f25c4e] inset-[71.43%_85.71%_7.14%_0] rounded-[1px]" />
      <div className="absolute bg-[#f25c4e] bottom-[7.14%] left-[28.57%] right-[57.14%] rounded-[1px] top-1/2" />
      <div className="absolute bg-[#f25c4e] inset-[28.57%_28.57%_7.14%_57.14%] rounded-[1px]" />
      <div className="absolute bg-[#f25c4e] inset-[7.14%_0_7.14%_85.71%] rounded-[1px]" />
    </div>
  );
}

function Frame207() {
  return (
    <div className="relative shrink-0 size-[14px]">
      <Group68 />
    </div>
  );
}

function Urgent() {
  return (
    <div className="content-stretch flex items-end relative shrink-0 size-[14px]" data-name="Urgent">
      <Frame207 />
    </div>
  );
}

function Frame129() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <Urgent />
      <p className="font-['Poppins:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#364658] text-[12px]">Urgent</p>
    </div>
  );
}

function ChevronDown45() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame191() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <ChevronDown45 />
    </div>
  );
}

function IconDropdwon4() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Icon Dropdwon">
      <Frame129 />
      <Frame191 />
    </div>
  );
}

function Group69() {
  return (
    <div className="absolute contents inset-[7.14%_0]">
      <div className="absolute bg-[#f5bc18] inset-[71.43%_85.71%_7.14%_0] rounded-[1px]" />
      <div className="absolute bg-[#f5bc18] bottom-[7.14%] left-[28.57%] right-[57.14%] rounded-[1px] top-1/2" />
      <div className="absolute bg-[#a5bad0] inset-[28.57%_28.57%_7.14%_57.14%] rounded-[1px]" />
      <div className="absolute bg-[#a5bad0] inset-[7.14%_0_7.14%_85.71%] rounded-[1px]" />
    </div>
  );
}

function Frame208() {
  return (
    <div className="relative shrink-0 size-[14px]">
      <Group69 />
    </div>
  );
}

function Medium() {
  return (
    <div className="content-stretch flex items-end relative shrink-0 size-[14px]" data-name="Medium">
      <Frame208 />
    </div>
  );
}

function Frame130() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <Medium />
      <p className="font-['Poppins:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#364658] text-[12px]">Medium</p>
    </div>
  );
}

function ChevronDown46() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame192() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <ChevronDown46 />
    </div>
  );
}

function IconDropdwon5() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Icon Dropdwon">
      <Frame130 />
      <Frame192 />
    </div>
  );
}

function Group70() {
  return (
    <div className="absolute contents inset-[7.14%_0]">
      <div className="absolute bg-[#f58518] inset-[71.43%_85.71%_7.14%_0] rounded-[1px]" />
      <div className="absolute bg-[#f58518] bottom-[7.14%] left-[28.57%] right-[57.14%] rounded-[1px] top-1/2" />
      <div className="absolute bg-[#f58518] inset-[28.57%_28.57%_7.14%_57.14%] rounded-[1px]" />
      <div className="absolute bg-[#a5bad0] inset-[7.14%_0_7.14%_85.71%] rounded-[1px]" />
    </div>
  );
}

function Frame209() {
  return (
    <div className="relative shrink-0 size-[14px]">
      <Group70 />
    </div>
  );
}

function High1() {
  return (
    <div className="content-stretch flex items-end relative shrink-0 size-[14px]" data-name="High">
      <Frame209 />
    </div>
  );
}

function Frame131() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <High1 />
      <p className="font-['Poppins:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#364658] text-[12px]">High</p>
    </div>
  );
}

function ChevronDown47() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame193() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <ChevronDown47 />
    </div>
  );
}

function IconDropdwon6() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Icon Dropdwon">
      <Frame131 />
      <Frame193 />
    </div>
  );
}

function Group71() {
  return (
    <div className="absolute contents inset-[7.14%_0]">
      <div className="absolute bg-[#f25c4e] inset-[71.43%_85.71%_7.14%_0] rounded-[1px]" />
      <div className="absolute bg-[#f25c4e] bottom-[7.14%] left-[28.57%] right-[57.14%] rounded-[1px] top-1/2" />
      <div className="absolute bg-[#f25c4e] inset-[28.57%_28.57%_7.14%_57.14%] rounded-[1px]" />
      <div className="absolute bg-[#f25c4e] inset-[7.14%_0_7.14%_85.71%] rounded-[1px]" />
    </div>
  );
}

function Frame210() {
  return (
    <div className="relative shrink-0 size-[14px]">
      <Group71 />
    </div>
  );
}

function Urgent1() {
  return (
    <div className="content-stretch flex items-end relative shrink-0 size-[14px]" data-name="Urgent">
      <Frame210 />
    </div>
  );
}

function Frame132() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <Urgent1 />
      <p className="font-['Poppins:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#364658] text-[12px]">Urgent</p>
    </div>
  );
}

function ChevronDown48() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame194() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <ChevronDown48 />
    </div>
  );
}

function IconDropdwon7() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Icon Dropdwon">
      <Frame132 />
      <Frame194 />
    </div>
  );
}

function Group72() {
  return (
    <div className="absolute contents inset-[7.14%_0]">
      <div className="absolute bg-[#89c540] inset-[71.43%_85.71%_7.14%_0] rounded-[1px]" />
      <div className="absolute bg-[#a5bad0] bottom-[7.14%] left-[28.57%] right-[57.14%] rounded-[1px] top-1/2" />
      <div className="absolute bg-[#a5bad0] inset-[28.57%_28.57%_7.14%_57.14%] rounded-[1px]" />
      <div className="absolute bg-[#a5bad0] inset-[7.14%_0_7.14%_85.71%] rounded-[1px]" />
    </div>
  );
}

function Frame211() {
  return (
    <div className="relative shrink-0 size-[14px]">
      <Group72 />
    </div>
  );
}

function Low3() {
  return (
    <div className="content-stretch flex h-[14px] items-end relative shrink-0" data-name="Low">
      <Frame211 />
    </div>
  );
}

function Frame133() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <Low3 />
      <p className="font-['Poppins:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#364658] text-[12px]">Low</p>
    </div>
  );
}

function ChevronDown49() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame195() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <ChevronDown49 />
    </div>
  );
}

function IconDropdwon8() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Icon Dropdwon">
      <Frame133 />
      <Frame195 />
    </div>
  );
}

function Group73() {
  return (
    <div className="absolute contents inset-[7.14%_0]">
      <div className="absolute bg-[#89c540] inset-[71.43%_85.71%_7.14%_0] rounded-[1px]" />
      <div className="absolute bg-[#a5bad0] bottom-[7.14%] left-[28.57%] right-[57.14%] rounded-[1px] top-1/2" />
      <div className="absolute bg-[#a5bad0] inset-[28.57%_28.57%_7.14%_57.14%] rounded-[1px]" />
      <div className="absolute bg-[#a5bad0] inset-[7.14%_0_7.14%_85.71%] rounded-[1px]" />
    </div>
  );
}

function Frame212() {
  return (
    <div className="relative shrink-0 size-[14px]">
      <Group73 />
    </div>
  );
}

function Low4() {
  return (
    <div className="content-stretch flex h-[14px] items-end relative shrink-0" data-name="Low">
      <Frame212 />
    </div>
  );
}

function Frame134() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <Low4 />
      <p className="font-['Poppins:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#364658] text-[12px]">Low</p>
    </div>
  );
}

function ChevronDown50() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame196() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <ChevronDown50 />
    </div>
  );
}

function IconDropdwon9() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Icon Dropdwon">
      <Frame134 />
      <Frame196 />
    </div>
  );
}

function Group74() {
  return (
    <div className="absolute contents inset-[7.14%_0]">
      <div className="absolute bg-[#f58518] inset-[71.43%_85.71%_7.14%_0] rounded-[1px]" />
      <div className="absolute bg-[#f58518] bottom-[7.14%] left-[28.57%] right-[57.14%] rounded-[1px] top-1/2" />
      <div className="absolute bg-[#f58518] inset-[28.57%_28.57%_7.14%_57.14%] rounded-[1px]" />
      <div className="absolute bg-[#a5bad0] inset-[7.14%_0_7.14%_85.71%] rounded-[1px]" />
    </div>
  );
}

function Frame213() {
  return (
    <div className="relative shrink-0 size-[14px]">
      <Group74 />
    </div>
  );
}

function High2() {
  return (
    <div className="content-stretch flex items-end relative shrink-0 size-[14px]" data-name="High">
      <Frame213 />
    </div>
  );
}

function Frame135() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <High2 />
      <p className="font-['Poppins:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#364658] text-[12px]">High</p>
    </div>
  );
}

function ChevronDown51() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame197() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <ChevronDown51 />
    </div>
  );
}

function IconDropdwon10() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Icon Dropdwon">
      <Frame135 />
      <Frame197 />
    </div>
  );
}

function Group75() {
  return (
    <div className="absolute contents inset-[7.14%_0]">
      <div className="absolute bg-[#f25c4e] inset-[71.43%_85.71%_7.14%_0] rounded-[1px]" />
      <div className="absolute bg-[#f25c4e] bottom-[7.14%] left-[28.57%] right-[57.14%] rounded-[1px] top-1/2" />
      <div className="absolute bg-[#f25c4e] inset-[28.57%_28.57%_7.14%_57.14%] rounded-[1px]" />
      <div className="absolute bg-[#f25c4e] inset-[7.14%_0_7.14%_85.71%] rounded-[1px]" />
    </div>
  );
}

function Frame214() {
  return (
    <div className="relative shrink-0 size-[14px]">
      <Group75 />
    </div>
  );
}

function Urgent2() {
  return (
    <div className="content-stretch flex items-end relative shrink-0 size-[14px]" data-name="Urgent">
      <Frame214 />
    </div>
  );
}

function Frame136() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <Urgent2 />
      <p className="font-['Poppins:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#364658] text-[12px]">Urgent</p>
    </div>
  );
}

function ChevronDown52() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame198() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <ChevronDown52 />
    </div>
  );
}

function IconDropdwon11() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Icon Dropdwon">
      <Frame136 />
      <Frame198 />
    </div>
  );
}

function Group76() {
  return (
    <div className="absolute contents inset-[7.14%_0]">
      <div className="absolute bg-[#f5bc18] inset-[71.43%_85.71%_7.14%_0] rounded-[1px]" />
      <div className="absolute bg-[#f5bc18] bottom-[7.14%] left-[28.57%] right-[57.14%] rounded-[1px] top-1/2" />
      <div className="absolute bg-[#a5bad0] inset-[28.57%_28.57%_7.14%_57.14%] rounded-[1px]" />
      <div className="absolute bg-[#a5bad0] inset-[7.14%_0_7.14%_85.71%] rounded-[1px]" />
    </div>
  );
}

function Frame215() {
  return (
    <div className="relative shrink-0 size-[14px]">
      <Group76 />
    </div>
  );
}

function Medium1() {
  return (
    <div className="content-stretch flex items-end relative shrink-0 size-[14px]" data-name="Medium">
      <Frame215 />
    </div>
  );
}

function Frame137() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <Medium1 />
      <p className="font-['Poppins:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#364658] text-[12px]">Medium</p>
    </div>
  );
}

function ChevronDown53() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame199() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <ChevronDown53 />
    </div>
  );
}

function IconDropdwon12() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Icon Dropdwon">
      <Frame137 />
      <Frame199 />
    </div>
  );
}

function Group77() {
  return (
    <div className="absolute contents inset-[7.14%_0]">
      <div className="absolute bg-[#f58518] inset-[71.43%_85.71%_7.14%_0] rounded-[1px]" />
      <div className="absolute bg-[#f58518] bottom-[7.14%] left-[28.57%] right-[57.14%] rounded-[1px] top-1/2" />
      <div className="absolute bg-[#f58518] inset-[28.57%_28.57%_7.14%_57.14%] rounded-[1px]" />
      <div className="absolute bg-[#a5bad0] inset-[7.14%_0_7.14%_85.71%] rounded-[1px]" />
    </div>
  );
}

function Frame216() {
  return (
    <div className="relative shrink-0 size-[14px]">
      <Group77 />
    </div>
  );
}

function High3() {
  return (
    <div className="content-stretch flex items-end relative shrink-0 size-[14px]" data-name="High">
      <Frame216 />
    </div>
  );
}

function Frame138() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <High3 />
      <p className="font-['Poppins:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#364658] text-[12px]">High</p>
    </div>
  );
}

function ChevronDown54() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame200() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <ChevronDown54 />
    </div>
  );
}

function IconDropdwon13() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Icon Dropdwon">
      <Frame138 />
      <Frame200 />
    </div>
  );
}

function Group78() {
  return (
    <div className="absolute contents inset-[7.14%_0]">
      <div className="absolute bg-[#89c540] inset-[71.43%_85.71%_7.14%_0] rounded-[1px]" />
      <div className="absolute bg-[#a5bad0] bottom-[7.14%] left-[28.57%] right-[57.14%] rounded-[1px] top-1/2" />
      <div className="absolute bg-[#a5bad0] inset-[28.57%_28.57%_7.14%_57.14%] rounded-[1px]" />
      <div className="absolute bg-[#a5bad0] inset-[7.14%_0_7.14%_85.71%] rounded-[1px]" />
    </div>
  );
}

function Frame217() {
  return (
    <div className="relative shrink-0 size-[14px]">
      <Group78 />
    </div>
  );
}

function Low5() {
  return (
    <div className="content-stretch flex h-[14px] items-end relative shrink-0" data-name="Low">
      <Frame217 />
    </div>
  );
}

function Frame139() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <Low5 />
      <p className="font-['Poppins:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#364658] text-[12px]">Low</p>
    </div>
  );
}

function ChevronDown55() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame201() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <ChevronDown55 />
    </div>
  );
}

function IconDropdwon14() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Icon Dropdwon">
      <Frame139 />
      <Frame201 />
    </div>
  );
}

function Group79() {
  return (
    <div className="absolute contents inset-[7.14%_0]">
      <div className="absolute bg-[#89c540] inset-[71.43%_85.71%_7.14%_0] rounded-[1px]" />
      <div className="absolute bg-[#a5bad0] bottom-[7.14%] left-[28.57%] right-[57.14%] rounded-[1px] top-1/2" />
      <div className="absolute bg-[#a5bad0] inset-[28.57%_28.57%_7.14%_57.14%] rounded-[1px]" />
      <div className="absolute bg-[#a5bad0] inset-[7.14%_0_7.14%_85.71%] rounded-[1px]" />
    </div>
  );
}

function Frame218() {
  return (
    <div className="relative shrink-0 size-[14px]">
      <Group79 />
    </div>
  );
}

function Low6() {
  return (
    <div className="content-stretch flex h-[14px] items-end relative shrink-0" data-name="Low">
      <Frame218 />
    </div>
  );
}

function Frame140() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <Low6 />
      <p className="font-['Poppins:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#364658] text-[12px]">Low</p>
    </div>
  );
}

function ChevronDown56() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame202() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <ChevronDown56 />
    </div>
  );
}

function IconDropdwon15() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Icon Dropdwon">
      <Frame140 />
      <Frame202 />
    </div>
  );
}

function Group80() {
  return (
    <div className="absolute contents inset-[7.14%_0]">
      <div className="absolute bg-[#f58518] inset-[71.43%_85.71%_7.14%_0] rounded-[1px]" />
      <div className="absolute bg-[#f58518] bottom-[7.14%] left-[28.57%] right-[57.14%] rounded-[1px] top-1/2" />
      <div className="absolute bg-[#f58518] inset-[28.57%_28.57%_7.14%_57.14%] rounded-[1px]" />
      <div className="absolute bg-[#a5bad0] inset-[7.14%_0_7.14%_85.71%] rounded-[1px]" />
    </div>
  );
}

function Frame219() {
  return (
    <div className="relative shrink-0 size-[14px]">
      <Group80 />
    </div>
  );
}

function High4() {
  return (
    <div className="content-stretch flex items-end relative shrink-0 size-[14px]" data-name="High">
      <Frame219 />
    </div>
  );
}

function Frame141() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <High4 />
      <p className="font-['Poppins:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#364658] text-[12px]">High</p>
    </div>
  );
}

function ChevronDown57() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame220() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <ChevronDown57 />
    </div>
  );
}

function IconDropdwon16() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Icon Dropdwon">
      <Frame141 />
      <Frame220 />
    </div>
  );
}

function Group81() {
  return (
    <div className="absolute contents inset-[7.14%_0]">
      <div className="absolute bg-[#f25c4e] inset-[71.43%_85.71%_7.14%_0] rounded-[1px]" />
      <div className="absolute bg-[#f25c4e] bottom-[7.14%] left-[28.57%] right-[57.14%] rounded-[1px] top-1/2" />
      <div className="absolute bg-[#f25c4e] inset-[28.57%_28.57%_7.14%_57.14%] rounded-[1px]" />
      <div className="absolute bg-[#f25c4e] inset-[7.14%_0_7.14%_85.71%] rounded-[1px]" />
    </div>
  );
}

function Frame221() {
  return (
    <div className="relative shrink-0 size-[14px]">
      <Group81 />
    </div>
  );
}

function Urgent3() {
  return (
    <div className="content-stretch flex items-end relative shrink-0 size-[14px]" data-name="Urgent">
      <Frame221 />
    </div>
  );
}

function Frame142() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <Urgent3 />
      <p className="font-['Poppins:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#364658] text-[12px]">Urgent</p>
    </div>
  );
}

function ChevronDown58() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame222() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <ChevronDown58 />
    </div>
  );
}

function IconDropdwon17() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Icon Dropdwon">
      <Frame142 />
      <Frame222 />
    </div>
  );
}

function Group82() {
  return (
    <div className="absolute contents inset-[7.14%_0]">
      <div className="absolute bg-[#f5bc18] inset-[71.43%_85.71%_7.14%_0] rounded-[1px]" />
      <div className="absolute bg-[#f5bc18] bottom-[7.14%] left-[28.57%] right-[57.14%] rounded-[1px] top-1/2" />
      <div className="absolute bg-[#a5bad0] inset-[28.57%_28.57%_7.14%_57.14%] rounded-[1px]" />
      <div className="absolute bg-[#a5bad0] inset-[7.14%_0_7.14%_85.71%] rounded-[1px]" />
    </div>
  );
}

function Frame223() {
  return (
    <div className="relative shrink-0 size-[14px]">
      <Group82 />
    </div>
  );
}

function Medium2() {
  return (
    <div className="content-stretch flex items-end relative shrink-0 size-[14px]" data-name="Medium">
      <Frame223 />
    </div>
  );
}

function Frame143() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <Medium2 />
      <p className="font-['Poppins:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#364658] text-[12px]">Medium</p>
    </div>
  );
}

function ChevronDown59() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame224() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <ChevronDown59 />
    </div>
  );
}

function IconDropdwon18() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Icon Dropdwon">
      <Frame143 />
      <Frame224 />
    </div>
  );
}

function Group83() {
  return (
    <div className="absolute contents inset-[7.14%_0]">
      <div className="absolute bg-[#f58518] inset-[71.43%_85.71%_7.14%_0] rounded-[1px]" />
      <div className="absolute bg-[#f58518] bottom-[7.14%] left-[28.57%] right-[57.14%] rounded-[1px] top-1/2" />
      <div className="absolute bg-[#f58518] inset-[28.57%_28.57%_7.14%_57.14%] rounded-[1px]" />
      <div className="absolute bg-[#a5bad0] inset-[7.14%_0_7.14%_85.71%] rounded-[1px]" />
    </div>
  );
}

function Frame225() {
  return (
    <div className="relative shrink-0 size-[14px]">
      <Group83 />
    </div>
  );
}

function High5() {
  return (
    <div className="content-stretch flex items-end relative shrink-0 size-[14px]" data-name="High">
      <Frame225 />
    </div>
  );
}

function Frame144() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
      <High5 />
      <p className="font-['Poppins:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#364658] text-[12px]">High</p>
    </div>
  );
}

function ChevronDown60() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="chevron-down" opacity="0">
          <path d={svgPaths.p5860980} fill="var(--fill-0, #364658)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame226() {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <ChevronDown60 />
    </div>
  );
}

function IconDropdwon19() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[6px] py-[4px] relative rounded-[6px] shrink-0" data-name="Icon Dropdwon">
      <Frame144 />
      <Frame226 />
    </div>
  );
}

function Frame5() {
  return (
    <div className="col-1 content-stretch flex flex-col gap-[13px] items-start ml-0 mt-0 relative row-1">
      <IconDropdwon />
      <IconDropdwon1 />
      <IconDropdwon2 />
      <IconDropdwon3 />
      <IconDropdwon4 />
      <IconDropdwon5 />
      <IconDropdwon6 />
      <IconDropdwon7 />
      <IconDropdwon8 />
      <IconDropdwon9 />
      <IconDropdwon10 />
      <IconDropdwon11 />
      <IconDropdwon12 />
      <IconDropdwon13 />
      <IconDropdwon14 />
      <IconDropdwon15 />
      <IconDropdwon16 />
      <IconDropdwon17 />
      <IconDropdwon18 />
      <IconDropdwon19 />
    </div>
  );
}

function Group12() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-[31px] place-items-start relative row-1">
      <Frame5 />
    </div>
  );
}

function Group32() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <Frame36 />
      <Group12 />
    </div>
  );
}

function Frame25() {
  return (
    <div className="absolute content-stretch flex items-start justify-between leading-[0] left-[34px] top-[0.98px] w-[1811px]">
      <Group20 />
      <Group29 />
      <Group22 />
      <Group23 />
      <Group28 />
      <Group27 />
      <Group30 />
      <Group31 />
      <Group32 />
    </div>
  );
}

function Group33() {
  return (
    <div className="absolute contents left-0 top-[0.32px]">
      <Frame22 />
      <Frame23 />
      <div className="absolute bg-[#dfe5ed] h-px left-0 opacity-70 rounded-[2px] top-[23.98px] w-[1865.217px]" />
      <Group21 />
      <Frame25 />
    </div>
  );
}

function Group35() {
  return (
    <div className="absolute contents left-0 top-[0.32px]">
      <Group33 />
    </div>
  );
}

function Frame230() {
  return (
    <div className="absolute h-[791px] left-[55px] overflow-x-clip overflow-y-auto top-[167px] w-[1865px]">
      <Group35 />
    </div>
  );
}

function UStar() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="u:star">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="u:star">
          <path d={svgPaths.p3eac4c80} fill="var(--fill-0, #7B8FA5)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Close() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="close">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g>
          <path d={svgPaths.p1ac53300} fill="var(--fill-0, #7B8FA5)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame145() {
  return (
    <div className="bg-[#dfe5ed] col-1 content-stretch flex gap-[4px] items-center ml-0 mt-0 px-[8px] relative rounded-[4px] row-1">
      <p className="font-['Poppins:Regular',sans-serif] leading-[22px] not-italic relative shrink-0 text-[#364658] text-[12px]">Status Not in Closed</p>
      <Close />
    </div>
  );
}

function Group84() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <Frame145 />
    </div>
  );
}

function Close1() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="close">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g>
          <path d={svgPaths.p1ac53300} fill="var(--fill-0, #7B8FA5)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame146() {
  return (
    <div className="bg-[#dfe5ed] col-1 content-stretch flex gap-[4px] items-center ml-0 mt-0 px-[8px] relative rounded-[4px] row-1">
      <p className="font-['Poppins:Regular',sans-serif] leading-[22px] not-italic relative shrink-0 text-[#364658] text-[12px]">Status Not in Closed</p>
      <Close1 />
    </div>
  );
}

function Group85() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <Frame146 />
    </div>
  );
}

function Frame229() {
  return (
    <div className="absolute content-stretch flex gap-[8px] items-center left-[66px] p-[8px] rounded-[8px] top-[108.5px] w-[1842px]">
      <div aria-hidden="true" className="absolute border border-[#dfe5ed] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <UStar />
      <Group84 />
      <Group85 />
      <p className="font-['Poppins:Regular',sans-serif] leading-[22px] not-italic relative shrink-0 text-[#7b8fa5] text-[12px]">Select field or enter a keyword to search...</p>
    </div>
  );
}

function SkipPrevious24Px() {
  return (
    <div className="col-1 ml-[7px] mt-[7px] relative row-1 size-[18px]" data-name="skip_previous-24px 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="skip_previous-24px 1">
          <path d={svgPaths.p3398a780} fill="var(--fill-0, #A5BAD0)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group8() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <div className="bg-[#7b8fa5] col-1 ml-0 mt-0 opacity-0 rounded-[4px] row-1 size-[32px]" />
      <SkipPrevious24Px />
    </div>
  );
}

function CaretLeft() {
  return (
    <div className="col-1 ml-[7px] mt-[7px] relative row-1 size-[18px]" data-name="caret-left">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="caret-left">
          <path d={svgPaths.pca4c700} fill="var(--fill-0, #A5BAD0)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Group9() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <div className="bg-[#7b8fa5] col-1 ml-0 mt-0 opacity-0 rounded-[4px] row-1 size-[32px]" />
      <CaretLeft />
    </div>
  );
}

function Group5() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <div className="bg-[#eef2f6] col-1 ml-0 mt-0 rounded-[4px] row-1 size-[32px]" />
      <p className="col-1 font-['Poppins:Regular',sans-serif] leading-[normal] ml-[14px] mt-[7px] not-italic relative row-1 text-[#364658] text-[12px]">1</p>
    </div>
  );
}

function Group4() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <div className="bg-[#a5bad0] col-1 ml-0 mt-0 opacity-0 rounded-[4px] row-1 size-[32px]" />
      <p className="col-1 font-['Poppins:Regular',sans-serif] leading-[normal] ml-[12px] mt-[7px] not-italic relative row-1 text-[#364658] text-[12px]">2</p>
    </div>
  );
}

function Group6() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <div className="bg-[#a5bad0] col-1 ml-0 mt-0 opacity-0 rounded-[4px] row-1 size-[32px]" />
      <p className="col-1 font-['Poppins:Regular',sans-serif] leading-[normal] ml-[12px] mt-[7px] not-italic relative row-1 text-[#364658] text-[12px]">3</p>
    </div>
  );
}

function CaretRight() {
  return (
    <div className="col-1 ml-[7px] mt-[7px] relative row-1 size-[18px]" data-name="caret-right">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="caret-right">
          <path d={svgPaths.p145eaf00} fill="var(--fill-0, #A5BAD0)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Group7() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <div className="bg-[#7b8fa5] col-1 ml-0 mt-0 opacity-0 rounded-[4px] row-1 size-[32px]" />
      <CaretRight />
    </div>
  );
}

function SkipNext24Px() {
  return (
    <div className="col-1 ml-[7px] mt-[7px] relative row-1 size-[18px]" data-name="skip_next-24px 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="skip_next-24px 1">
          <path d={svgPaths.p38264200} fill="var(--fill-0, #A5BAD0)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group10() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <div className="bg-[#7b8fa5] col-1 ml-0 mt-0 opacity-0 rounded-[4px] row-1 size-[32px]" />
      <SkipNext24Px />
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex items-start leading-[0] relative shrink-0">
      <Group8 />
      <Group9 />
      <Group5 />
      <Group4 />
      <Group6 />
      <Group7 />
      <Group10 />
    </div>
  );
}

function CaretDown() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="caret-down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="caret-down">
          <path d={svgPaths.p179a6480} fill="var(--fill-0, #A5BAD0)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame102() {
  return (
    <div className="bg-[#eef2f6] content-stretch flex gap-[16px] items-center justify-center p-[7px] relative rounded-[4px] shrink-0">
      <p className="font-['Poppins:Regular',sans-serif] leading-[normal] not-italic opacity-80 relative shrink-0 text-[#364658] text-[12px]">50</p>
      <CaretDown />
    </div>
  );
}

function Frame104() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <Frame102 />
      <p className="font-['Poppins:Regular',sans-serif] leading-[normal] not-italic opacity-80 relative shrink-0 text-[#7b8fa5] text-[12px]">items per page</p>
    </div>
  );
}

function Frame103() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0">
      <Frame2 />
      <Frame104 />
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
      <Frame103 />
      <p className="font-['Poppins:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#7b8fa5] text-[12px]">1 - 10 of 86 items</p>
    </div>
  );
}

function Pagination() {
  return (
    <div className="absolute bg-white bottom-0 content-stretch flex flex-col items-start px-[24px] py-[10px] right-0 w-[1865px]" data-name="Pagination">
      <div aria-hidden="true" className="absolute border-[#dfe5ed] border-solid border-t inset-0 pointer-events-none" />
      <Frame3 />
    </div>
  );
}

export default function DashboardCreateWidget() {
  return (
    <div className="bg-white relative size-full" data-name="Dashboard | Create Widget">
      <SideMenuWhite />
      <Frame72 />
      <Frame227 />
      <Frame230 />
      <Frame229 />
      <Pagination />
    </div>
  );
}