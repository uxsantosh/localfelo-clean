import React from 'react';
import { Zap, ShoppingBag, Sparkles } from 'lucide-react';
import { TypingAnimation } from './TypingAnimation';

interface IntroModalProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function IntroModal({ onComplete, onSkip }: IntroModalProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-3 sm:p-4">
      <div className="w-full max-w-md bg-white overflow-hidden flex flex-col max-h-[95vh]" style={{ borderRadius: '20px' }}>
        {/* Compact Header - Just Logo */}
        <div className="text-center pt-5 pb-4 px-5 bg-white flex-shrink-0">
          <svg width="130" height="21" viewBox="0 0 1299 207" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
            <path d="M118.027 109.199L191.251 179.81L165.568 206.443L92.6514 136.129L26.9277 205.877L0 180.503L83.1953 92.2139H13.4639V55.2139H168.899L118.027 109.199ZM210.86 94.4766L185.385 121.311L148.632 86.417L174.106 59.583L210.86 94.4766ZM185.964 0C199.495 0 210.464 10.969 210.464 24.5C210.464 38.031 199.495 49 185.964 49C172.433 49 161.464 38.031 161.464 24.5C161.464 10.969 172.433 0 185.964 0Z" fill="black"/>
            <path d="M278.838 171.202H327.456L321.462 204.28H229.11L256.86 47.77H300.372L278.838 171.202Z" fill="black"/>
            <path d="M396.101 205.834C385.297 205.834 375.677 203.688 367.241 199.396C358.953 195.104 352.515 189.036 347.927 181.192C343.339 173.348 341.045 164.172 341.045 153.664C341.045 139.456 344.375 126.58 351.035 115.036C357.843 103.492 367.167 94.464 379.007 87.952C390.847 81.44 404.093 78.184 418.745 78.184C429.549 78.184 439.095 80.33 447.383 84.622C455.819 88.914 462.331 95.056 466.919 103.048C471.655 110.892 474.023 120.068 474.023 130.576C474.023 144.932 470.619 157.882 463.811 169.426C457.003 180.822 447.679 189.776 435.839 196.288C423.999 202.652 410.753 205.834 396.101 205.834ZM402.761 168.316C407.941 168.316 412.529 166.688 416.525 163.432C420.669 160.176 423.777 155.958 425.849 150.778C428.069 145.598 429.179 140.27 429.179 134.794C429.179 128.578 427.551 123.842 424.295 120.586C421.187 117.33 417.117 115.702 412.085 115.702C406.757 115.702 402.095 117.33 398.099 120.586C394.251 123.842 391.217 128.06 388.997 133.24C386.925 138.42 385.889 143.822 385.889 149.446C385.889 155.662 387.443 160.398 390.551 163.654C393.659 166.762 397.729 168.316 402.761 168.316Z" fill="black"/>
            <path d="M483.29 141.898C485.658 128.874 490.32 117.626 497.276 108.154C504.38 98.534 513.112 91.134 523.472 85.954C533.98 80.774 545.376 78.184 557.66 78.184C573.496 78.184 586.076 82.55 595.4 91.282C604.724 99.866 609.608 111.928 610.052 127.468H563.654C562.47 119.328 557.956 115.258 550.112 115.258C544.636 115.258 539.9 117.552 535.904 122.14C531.908 126.58 529.17 133.166 527.69 141.898C527.098 144.858 526.802 147.818 526.802 150.778C526.802 156.698 528.06 161.212 530.576 164.32C533.092 167.28 536.496 168.76 540.788 168.76C548.78 168.76 554.626 164.69 558.326 156.55H604.724C598.952 171.942 589.85 184.004 577.418 192.736C565.134 201.468 551 205.834 535.016 205.834C518.736 205.834 505.786 201.394 496.166 192.514C486.694 183.634 481.958 171.424 481.958 155.884C481.958 151.444 482.402 146.782 483.29 141.898Z" fill="black"/>
            <path d="M618.137 141.898C620.505 129.022 624.871 117.774 631.235 108.154C637.599 98.534 645.221 91.134 654.101 85.954C663.129 80.774 672.601 78.184 682.517 78.184C691.101 78.184 698.205 79.886 703.829 83.29C709.453 86.694 713.375 91.282 715.595 97.054L718.703 79.738H762.215L740.237 204.28H696.725L699.833 186.964C695.541 192.736 689.917 197.324 682.961 200.728C676.005 204.132 668.309 205.834 659.873 205.834C646.849 205.834 636.415 201.542 628.571 192.958C620.727 184.226 616.805 172.386 616.805 157.438C616.805 152.554 617.249 147.374 618.137 141.898ZM707.825 141.898C708.269 139.678 708.491 137.606 708.491 135.682C708.491 129.466 706.715 124.656 703.163 121.252C699.759 117.848 695.319 116.146 689.843 116.146C683.331 116.146 677.485 118.44 672.305 123.028C667.125 127.468 663.869 133.758 662.537 141.898C662.093 144.118 661.871 146.264 661.871 148.336C661.871 154.552 663.573 159.362 666.977 162.766C670.529 166.17 675.043 167.872 680.519 167.872C687.031 167.872 692.877 165.578 698.057 160.99C703.237 156.402 706.493 150.038 707.825 141.898Z" fill="black"/>
            <path d="M837.848 40L808.766 204.28H765.032L794.114 40H837.848Z" fill="black"/>
            <path d="M967.189 47.77L961.195 82.402H898.591L893.707 109.93H939.661L933.889 143.008H887.935L877.057 204.28H833.323L861.073 47.77H967.189Z" fill="black"/>
            <path d="M1036.35 78.184C1052.63 78.184 1065.51 82.55 1074.98 91.282C1084.6 100.014 1089.41 111.928 1089.41 127.024C1089.41 132.056 1089.04 136.496 1088.3 140.344C1087.41 145.08 1086.52 148.484 1085.64 150.556H1003.27C1003.13 151.444 1003.05 152.776 1003.05 154.552C1003.05 160.176 1004.38 164.32 1007.05 166.984C1009.86 169.648 1013.56 170.98 1018.15 170.98C1025.4 170.98 1031.17 167.724 1035.46 161.212H1081.64C1078.24 169.796 1073.13 177.492 1066.32 184.3C1059.66 190.96 1051.74 196.214 1042.57 200.062C1033.54 203.91 1023.92 205.834 1013.71 205.834C997.428 205.834 984.478 201.394 974.858 192.514C965.238 183.634 960.428 171.424 960.428 155.884C960.428 151.444 960.872 146.782 961.76 141.898C964.128 128.874 968.79 117.626 975.746 108.154C982.85 98.534 991.582 91.134 1001.94 85.954C1012.45 80.774 1023.92 78.184 1036.35 78.184ZM1045.45 131.02C1045.75 128.948 1045.9 127.616 1045.9 127.024C1045.9 122.288 1044.42 118.736 1041.46 116.368C1038.5 113.852 1034.65 112.594 1029.91 112.594C1024.44 112.594 1019.7 114.148 1015.71 117.256C1011.71 120.364 1008.75 124.952 1006.83 131.02H1045.45Z" fill="black"/>
            <path d="M1167.38 40L1138.3 204.28H1094.56L1123.65 40H1167.38Z" fill="black"/>
            <path d="M1220.8 205.834C1209.99 205.834 1200.37 203.688 1191.94 199.396C1183.65 195.104 1177.21 189.036 1172.62 181.192C1168.03 173.348 1165.74 164.172 1165.74 153.664C1165.74 139.456 1169.07 126.58 1175.73 115.036C1182.54 103.492 1191.86 94.464 1203.7 87.952C1215.54 81.44 1228.79 78.184 1243.44 78.184C1254.24 78.184 1263.79 80.33 1272.08 84.622C1280.51 88.914 1287.03 95.056 1291.61 103.048C1296.35 110.892 1298.72 120.068 1298.72 130.576C1298.72 144.932 1295.31 157.882 1288.51 169.426C1281.7 180.822 1272.37 189.776 1260.53 196.288C1248.69 202.652 1235.45 205.834 1220.8 205.834ZM1227.46 168.316C1232.64 168.316 1237.22 166.688 1241.22 163.432C1245.36 160.176 1248.47 155.958 1250.54 150.778C1252.76 145.598 1253.87 140.27 1253.87 134.794C1253.87 128.578 1252.25 123.842 1248.99 120.586C1245.88 117.33 1241.81 115.702 1236.78 115.702C1231.45 115.702 1226.79 117.33 1222.79 120.586C1218.95 123.842 1215.91 128.06 1213.69 133.24C1211.62 138.42 1210.58 143.822 1210.58 149.446C1210.58 155.662 1212.14 160.398 1215.25 163.654C1218.35 166.762 1222.42 168.316 1227.46 168.316Z" fill="black"/>
          </svg>
        </div>

        {/* Scrollable Features Section */}
        <div className="px-5 pb-4 space-y-3 overflow-y-auto flex-1">
          {/* PRIMARY: Tasks - Selected State */}
          <div className="bg-[#CDFF00] p-4 border-2 border-[#CDFF00] shadow-[0_0_0_2px_black]" style={{ borderRadius: '14px' }}>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="flex-shrink-0 w-9 h-9 bg-black flex items-center justify-center" style={{ borderRadius: '8px' }}>
                <Zap className="w-[18px] h-[18px] text-[#CDFF00]" />
              </div>
              <h3 className="text-black text-[16px]" style={{ fontWeight: '800' }}>
                Tasks
              </h3>
            </div>
            <p className="text-black text-[13px] leading-relaxed mb-2" style={{ fontWeight: '600' }}>
              Need help? Post tasks. Want to earn? Complete tasks.
            </p>
            <div className="bg-black/10 px-3 py-2 min-h-[36px] flex items-center" style={{ borderRadius: '8px' }}>
              <div className="text-black text-[12px] leading-tight w-full">
                <TypingAnimation 
                  texts={[
                    'Need help with luggage shifting',
                    'Bring gas cylinder from market',
                    'Clean my car today',
                    'Help with Java coding issue',
                    'Pick up grocery from store',
                    'Fix leaking tap now'
                  ]}
                  typingSpeed={50}
                  deletingSpeed={30}
                  pauseDuration={2000}
                />
              </div>
            </div>
          </div>

          {/* SECONDARY: Wishes */}
          <div className="bg-white border-2 border-gray-200 p-4" style={{ borderRadius: '14px' }}>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="flex-shrink-0 w-9 h-9 bg-[#CDFF00] flex items-center justify-center" style={{ borderRadius: '8px' }}>
                <Sparkles className="w-[18px] h-[18px] text-black" />
              </div>
              <h3 className="text-black text-[16px]" style={{ fontWeight: '800' }}>
                Wishes
              </h3>
            </div>
            <p className="text-gray-700 text-[13px] leading-relaxed mb-2" style={{ fontWeight: '500' }}>
              Looking for something? Post a wish and people will respond.
            </p>
            <div className="bg-gray-50 px-3 py-2 min-h-[36px] flex items-center" style={{ borderRadius: '8px' }}>
              <div className="text-gray-700 text-[12px] leading-tight w-full">
                <TypingAnimation 
                  texts={[
                    'Looking for maths teacher',
                    'Looking for bike under ₹50,000',
                    'Looking for iPhone 14 under ₹30,000',
                    'Looking for wedding photographer',
                    'Looking for laptop under ₹25,000',
                    'Looking for gym trainer nearby'
                  ]}
                  typingSpeed={50}
                  deletingSpeed={30}
                  pauseDuration={2000}
                />
              </div>
            </div>
          </div>

          {/* SECONDARY: Marketplace */}
          <div className="bg-white border-2 border-gray-200 p-4" style={{ borderRadius: '14px' }}>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="flex-shrink-0 w-9 h-9 bg-[#CDFF00] flex items-center justify-center" style={{ borderRadius: '8px' }}>
                <ShoppingBag className="w-[18px] h-[18px] text-black" />
              </div>
              <h3 className="text-black text-[16px]" style={{ fontWeight: '800' }}>
                Marketplace
              </h3>
            </div>
            <p className="text-gray-700 text-[13px] leading-relaxed mb-2" style={{ fontWeight: '500' }}>
              Buy and sell anything locally. Chat directly with sellers.
            </p>
            <div className="bg-gray-50 px-3 py-2 min-h-[36px] flex items-center" style={{ borderRadius: '8px' }}>
              <div className="text-gray-700 text-[12px] leading-tight w-full">
                <TypingAnimation 
                  texts={[
                    'Sofa set in great condition',
                    'iPhone 13 under ₹35,000',
                    'Gaming laptop for sale',
                    'Kids bicycle barely used',
                    'Study table with chair',
                    'Books at 50% off'
                  ]}
                  typingSpeed={50}
                  deletingSpeed={30}
                  pauseDuration={2000}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Buttons - Fixed at Bottom */}
        <div className="px-5 py-5 space-y-2.5 bg-white border-t border-gray-100 flex-shrink-0">
          <button
            onClick={onComplete}
            className="w-full bg-[#CDFF00] text-black py-3.5 px-6 hover:bg-[#b8e600] transition-colors"
            style={{ fontWeight: '900', borderRadius: '11px', fontSize: '15px' }}
          >
            Get started
          </button>

          <button
            onClick={onSkip}
            className="w-full text-gray-500 text-[13px] py-2 hover:text-gray-700 transition-colors"
            style={{ fontWeight: '600' }}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}