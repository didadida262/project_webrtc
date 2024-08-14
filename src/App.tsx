/*
 * @Description:
 * @Author: didadida262
 * @Date: 2024-07-25 01:16:22
 * @LastEditors: didadida262
 * @LastEditTime: 2024-08-14 16:39:52
 */
import { ToastContainer } from "react-toastify";

import { useTranslation, switchLanguage } from "@/i18n";
import ButtonTheme from "@/components/Theme/ButtonTheme";
import customToast from "@/components/customToast";

import { ButtonCommon, EButtonType } from "./components/ButtonCommon";

import "react-toastify/dist/ReactToastify.css";

function App() {
  const { t } = useTranslation();

  return (
    <div className="flex h-screen w-full items-center justify-center text-green-500 bg-bgPrimaryColor">
      <span>WebRtc</span>
    </div>
  );
}

export default App;
