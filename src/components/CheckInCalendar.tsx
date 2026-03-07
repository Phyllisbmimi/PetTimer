import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Camera, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CheckInRecord } from '../types';

interface CheckInCalendarProps {
  checkIns: CheckInRecord[];
  onAddCheckIn: (checkIn: CheckInRecord) => void;
  streak: number;
}

export const CheckInCalendar: React.FC<CheckInCalendarProps> = ({
  checkIns,
  onAddCheckIn,
  streak,
}) => {
  const { t, i18n } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [activities, setActivities] = useState<string[]>([]);
  const [mood, setMood] = useState<'happy' | 'normal' | 'tired'>('happy');
  const [notes, setNotes] = useState('');

  const getLocale = () => {
    if (i18n.language === 'zh-HK') return 'zh-HK';
    if (i18n.language === 'zh-CN') return 'zh-CN';
    return 'en-US';
  };

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthName = (date: Date) => {
    return new Intl.DateTimeFormat(getLocale(), {
      year: 'numeric',
      month: 'long',
    }).format(date);
  };

  const weekdayLabels =
    i18n.language === 'en'
      ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      : ['日', '一', '二', '三', '四', '五', '六'];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getCheckInForDate = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return checkIns.find((checkIn) => {
      const checkInDate = new Date(checkIn.date);
      return (
        checkInDate.getFullYear() === date.getFullYear() &&
        checkInDate.getMonth() === date.getMonth() &&
        checkInDate.getDate() === date.getDate()
      );
    });
  };

  const handleAddCheckIn = () => {
    const today = new Date();
    const newCheckIn: CheckInRecord = {
      id: Date.now().toString(),
      date: today,
      focusTime: 125, // 預設 5 個番茄鐘
      activities,
      mood,
      notes,
      achievement: t('checkin.achievement'),
      photoUrl: undefined,
    };

    onAddCheckIn(newCheckIn);
    setActivities([]);
    setMood('happy');
    setNotes('');
    setShowCheckInForm(false);
  };

  const renderCalendarDays = () => {
    const days = [];
    const daysCount = daysInMonth(currentDate);
    const firstDay = firstDayOfMonth(currentDate);

    // 空白日期
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2" />);
    }

    // 實際日期
    for (let day = 1; day <= daysCount; day++) {
      const checkIn = getCheckInForDate(day);
      const isToday = new Date().toDateString() ===
        new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

      days.push(
        <div
          key={day}
          className={`p-2 rounded-lg text-center text-sm font-semibold cursor-pointer transition-all ${
            checkIn
              ? 'bg-accent text-dark hover:scale-105'
              : isToday
              ? 'bg-white/20 text-white border-2 border-white'
              : 'bg-white/10 text-white/60'
          }`}
          onClick={() => {
            if (isToday && !checkIn) {
              setShowCheckInForm(true);
            }
          }}
        >
          {day}
          {checkIn && <div className="text-lg">✅</div>}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="card-blur space-y-6">
      {/* 標題和連續簽到 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold text-white">📅 {t('checkin.title')}</h2>
          <div className="text-center bg-accent text-dark px-4 py-2 rounded-full">
            <p className="text-sm font-semibold">{t('checkin.streak')}</p>
            <p className="text-2xl font-bold">{streak}</p>
          </div>
        </div>

        {/* 月份選擇 */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={handlePrevMonth} className="text-white/60 hover:text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h3 className="text-xl font-bold text-white">
            {monthName(currentDate)}
          </h3>
          <button onClick={handleNextMonth} className="text-white/60 hover:text-white">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* 日曆網格 */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        {/* 週日標題 */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {weekdayLabels.map((day) => (
            <div key={day} className="text-center text-white/60 font-semibold text-sm">
              {day}
            </div>
          ))}
        </div>

        {/* 日期方格 */}
        <div className="grid grid-cols-7 gap-2">{renderCalendarDays()}</div>
      </div>

      {/* 簽到表單 */}
      {showCheckInForm && (
        <div className="bg-white/10 rounded-xl p-4 border border-white/20 space-y-4">
          <h3 className="text-white font-bold text-lg">{t('checkin.todayCheckin')}</h3>

          {/* 心情選擇 */}
          <div>
            <p className="text-white/80 font-semibold mb-2">{t('checkin.mood')}</p>
            <div className="flex gap-3">
              {(['happy', 'normal', 'tired'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  className={`text-3xl p-2 rounded-lg transition-all ${
                    mood === m ? 'scale-125 bg-white/20' : 'bg-white/10'
                  }`}
                >
                  {m === 'happy' && '😄'}
                  {m === 'normal' && '😊'}
                  {m === 'tired' && '😴'}
                </button>
              ))}
            </div>
          </div>

          {/* 活動標籤 */}
          <div>
            <p className="text-white/80 font-semibold mb-2">{t('checkin.today')}</p>
            <div className="flex flex-wrap gap-2">
              {[
                t('checkin.activities.study'),
                t('checkin.activities.work'),
                t('checkin.activities.exercise'),
                t('checkin.activities.create'),
                t('checkin.activities.rest'),
                t('checkin.activities.entertainment'),
              ].map((activity) => (
                <button
                  key={activity}
                  onClick={() =>
                    setActivities((prev) =>
                      prev.includes(activity)
                        ? prev.filter((a) => a !== activity)
                        : [...prev, activity]
                    )
                  }
                  className={`px-3 py-1 rounded-full text-sm font-semibold transition-all ${
                    activities.includes(activity)
                      ? 'bg-accent text-dark'
                      : 'bg-white/10 text-white/60'
                  }`}
                >
                  {activity}
                </button>
              ))}
            </div>
          </div>

          {/* 備註 */}
          <textarea
            placeholder={t('checkin.notes')}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-white/90 text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent text-sm"
          />

          {/* 照片和分享 */}
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 bg-white/10 text-white px-3 py-2 rounded-lg hover:bg-white/20 transition-colors">
              <Camera className="w-5 h-5" />
              {t('checkin.uploadPhoto')}
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 bg-white/10 text-white px-3 py-2 rounded-lg hover:bg-white/20 transition-colors">
              <Share2 className="w-5 h-5" />
              {t('checkin.shareIG')}
            </button>
          </div>

          {/* 操作按鍵 */}
          <div className="flex gap-2">
            <button onClick={handleAddCheckIn} className="flex-1 btn-primary">
              {t('checkin.checkinBtn')}
            </button>
            <button
              onClick={() => setShowCheckInForm(false)}
              className="flex-1 bg-gray-400 text-white px-4 py-2 rounded-full font-bold hover:bg-gray-500 transition-colors"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* 今日亮點 */}
      {getCheckInForDate(new Date().getDate()) && (
        <div className="bg-gradient-to-r from-accent/30 to-primary/30 rounded-xl p-4 border border-accent/50">
          <p className="text-white font-bold">{t('checkin.checkinDone')}</p>
          <p className="text-white/80 text-sm">
            {getCheckInForDate(new Date().getDate())?.achievement}
          </p>
        </div>
      )}
    </div>
  );
};

export default CheckInCalendar;
