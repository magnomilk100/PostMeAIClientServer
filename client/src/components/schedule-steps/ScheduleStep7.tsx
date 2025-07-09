import React, { useState, useEffect, useCallback } from 'react';
import { useScheduleWizard } from '@/contexts/ScheduleWizardContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { X, Plus } from 'lucide-react';
import { 
  SiFacebook, 
  SiInstagram, 
  SiLinkedin, 
  SiTiktok, 
  SiYoutube, 
  SiDiscord, 
  SiTelegram 
} from 'react-icons/si';

const platformConfigs = {
  facebook: {
    name: 'Facebook',
    icon: SiFacebook,
    color: '#1877F2'
  },
  instagram: {
    name: 'Instagram',
    icon: SiInstagram,
    color: '#E4405F'
  },
  linkedin: {
    name: 'LinkedIn',
    icon: SiLinkedin,
    color: '#0A66C2'
  },
  tiktok: {
    name: 'TikTok',
    icon: SiTiktok,
    color: '#000000'
  },
  youtube: {
    name: 'YouTube',
    icon: SiYoutube,
    color: '#FF0000'
  },
  discord: {
    name: 'Discord',
    icon: SiDiscord,
    color: '#5865F2'
  },
  telegram: {
    name: 'Telegram',
    icon: SiTelegram,
    color: '#26A5E4'
  }
};

const daysOfWeek = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' }
];

export default function ScheduleStep7() {
  const { scheduleData, updateScheduleData } = useScheduleWizard();
  const { toast } = useToast();
  
  // Separate calendar data for different modes
  const [normalCalendarDates, setNormalCalendarDates] = useState<Date[]>([]);
  const [normalCalendarConfigs, setNormalCalendarConfigs] = useState<{[key: string]: {hour: string, minute: string}}>({});
  const [postOnceCalendarDates, setPostOnceCalendarDates] = useState<Date[]>([]);
  const [postOnceCalendarConfigs, setPostOnceCalendarConfigs] = useState<{[key: string]: {hour: string, minute: string}}>({});
  
  const [currentConfigDate, setCurrentConfigDate] = useState<Date | null>(null);
  const [currentConfigTime, setCurrentConfigTime] = useState({ hour: '09', minute: '00' });
  const [dailyHour, setDailyHour] = useState("09");
  const [dailyMinute, setDailyMinute] = useState("00");
  const [weeklyDay, setWeeklyDay] = useState("monday");
  const [weeklyHour, setWeeklyHour] = useState("09");
  const [weeklyMinute, setWeeklyMinute] = useState("00");
  const [monthlyDay, setMonthlyDay] = useState("1");
  const [monthlyHour, setMonthlyHour] = useState("09");
  const [monthlyMinute, setMonthlyMinute] = useState("00");
  const [postJustOnce, setPostJustOnce] = useState(scheduleData.postJustOnce || false);
  const [postImmediately, setPostImmediately] = useState(scheduleData.postImmediately || false);

  // Get current calendar data based on "Post just once" status
  const getCurrentCalendarData = () => {
    if (postJustOnce) {
      return {
        selectedDates: postOnceCalendarDates,
        dateTimeConfigs: postOnceCalendarConfigs
      };
    } else {
      return {
        selectedDates: normalCalendarDates,
        dateTimeConfigs: normalCalendarConfigs
      };
    }
  };

  // Set current calendar data based on "Post just once" status
  const setCurrentCalendarData = (dates: Date[], configs: {[key: string]: {hour: string, minute: string}}) => {
    if (postJustOnce) {
      setPostOnceCalendarDates(dates);
      setPostOnceCalendarConfigs(configs);
    } else {
      setNormalCalendarDates(dates);
      setNormalCalendarConfigs(configs);
    }
  };

  // Restore calendar schedules from schedule wizard context when component mounts
  useEffect(() => {
    // Restore normal calendar schedules
    if (scheduleData.normalCalendarSchedules && scheduleData.normalCalendarSchedules.length > 0) {
      const restoredDates: Date[] = [];
      const restoredTimeConfigs: {[key: string]: {hour: string, minute: string}} = {};
      
      scheduleData.normalCalendarSchedules.forEach(schedule => {
        // Parse date string manually to avoid timezone issues
        const [year, month, day] = schedule.date.split('-').map(Number);
        const date = new Date(year, month - 1, day); // month is 0-indexed in Date constructor
        restoredDates.push(date);
        restoredTimeConfigs[schedule.date] = {
          hour: schedule.hour.toString().padStart(2, '0'),
          minute: schedule.minute.toString().padStart(2, '0')
        };
      });
      
      setNormalCalendarDates(restoredDates);
      setNormalCalendarConfigs(restoredTimeConfigs);
    }

    // Restore post-once calendar schedules
    if (scheduleData.postOnceCalendarSchedules && scheduleData.postOnceCalendarSchedules.length > 0) {
      const restoredDates: Date[] = [];
      const restoredTimeConfigs: {[key: string]: {hour: string, minute: string}} = {};
      
      scheduleData.postOnceCalendarSchedules.forEach(schedule => {
        // Parse date string manually to avoid timezone issues
        const [year, month, day] = schedule.date.split('-').map(Number);
        const date = new Date(year, month - 1, day); // month is 0-indexed in Date constructor
        restoredDates.push(date);
        restoredTimeConfigs[schedule.date] = {
          hour: schedule.hour.toString().padStart(2, '0'),
          minute: schedule.minute.toString().padStart(2, '0')
        };
      });
      
      setPostOnceCalendarDates(restoredDates);
      setPostOnceCalendarConfigs(restoredTimeConfigs);
    }
  }, []);

  // Update schedule wizard data when checkboxes change
  useEffect(() => {
    updateScheduleData({ postJustOnce });
  }, [postJustOnce]);

  useEffect(() => {
    updateScheduleData({ postImmediately });
  }, [postImmediately]);

  // Update schedule wizard context whenever calendar data changes
  useEffect(() => {
    const currentData = getCurrentCalendarData();
    updateCalendarSchedules(currentData.selectedDates, currentData.dateTimeConfigs);
  }, [normalCalendarDates, normalCalendarConfigs, postOnceCalendarDates, postOnceCalendarConfigs, postJustOnce]);

  const updateCalendarSchedules = (dates: Date[], timeConfigs: {[key: string]: {hour: string, minute: string}}) => {
    const calendarSchedules = dates.map(date => {
      // Use local timezone date formatting to avoid timezone offset issues
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      const timeConfig = timeConfigs[dateKey] || { hour: '09', minute: '00' };
      return {
        date: dateKey,
        hour: parseInt(timeConfig.hour),
        minute: parseInt(timeConfig.minute)
      };
    });
    
    // Update separate calendar stores based on current mode
    if (postJustOnce) {
      updateScheduleData({
        postOnceCalendarSchedules: calendarSchedules
      });
    } else {
      updateScheduleData({
        normalCalendarSchedules: calendarSchedules
      });
    }
    
    // Also update the main scheduleConfig.calendar to maintain compatibility
    updateScheduleData({
      scheduleConfig: {
        ...scheduleData.scheduleConfig,
        calendar: calendarSchedules
      }
    });
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (!date) return;
    
    // Check if "Post just once" is enabled and we already have 1 calendar schedule
    if (postJustOnce && getCurrentCalendarData().selectedDates.length >= 1) {
      toast({
        title: "Calendar Limit Reached",
        description: "When 'Post just once' is enabled, you can only schedule one calendar date.",
        variant: "warning"
      });
      return;
    }
    
    setCurrentConfigDate(date);
    setCurrentConfigTime({ hour: '09', minute: '00' });
  };

  const updateCurrentConfigTime = (field: 'hour' | 'minute', value: string) => {
    setCurrentConfigTime(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addCalendarDay = () => {
    if (!currentConfigDate) return;
    
    const currentData = getCurrentCalendarData();
    // Use local timezone date formatting to avoid timezone offset issues
    const year = currentConfigDate.getFullYear();
    const month = (currentConfigDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentConfigDate.getDate().toString().padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;
    const newDates = [...currentData.selectedDates, currentConfigDate];
    const newTimeConfigs = {
      ...currentData.dateTimeConfigs,
      [dateKey]: currentConfigTime
    };
    
    setCurrentCalendarData(newDates, newTimeConfigs);
    setCurrentConfigDate(null);
    
    toast({
      title: "Calendar Date Added",
      description: `Post scheduled for ${currentConfigDate.toLocaleDateString()} at ${currentConfigTime.hour}:${currentConfigTime.minute}`,
      variant: "success"
    });
  };

  const removeDateConfig = (dateKey: string) => {
    const currentData = getCurrentCalendarData();
    const updatedDates = currentData.selectedDates.filter(date => {
      // Use local timezone date formatting to avoid timezone offset issues
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const localDateKey = `${year}-${month}-${day}`;
      return localDateKey !== dateKey;
    });
    const updatedTimeConfigs = { ...currentData.dateTimeConfigs };
    delete updatedTimeConfigs[dateKey];
    
    setCurrentCalendarData(updatedDates, updatedTimeConfigs);
    
    toast({
      title: "Calendar Date Removed",
      description: "The scheduled date has been removed",
      variant: "success"
    });
  };

  const addDailySchedule = useCallback(() => {
    try {
      const newDailySchedule = {
        hour: parseInt(dailyHour),
        minute: parseInt(dailyMinute)
      };
      
      const currentDaily = scheduleData.scheduleConfig?.daily || [];
      updateScheduleData({
        scheduleConfig: {
          ...scheduleData.scheduleConfig,
          type: 'daily',
          daily: [...currentDaily, newDailySchedule]
        }
      });
      
      toast({
        title: "Daily Schedule Added",
        description: `Posts will be published daily at ${dailyHour}:${dailyMinute}`,
        variant: "success"
      });
    } catch (error) {
      console.error('Error adding daily schedule:', error);
      toast({
        title: "Error",
        description: "Failed to add daily schedule",
        variant: "destructive"
      });
    }
  }, [dailyHour, dailyMinute, scheduleData, updateScheduleData, toast]);

  const addWeeklySchedule = useCallback(() => {
    try {
      const newWeeklySchedule = {
        dayOfWeek: weeklyDay,
        hour: parseInt(weeklyHour),
        minute: parseInt(weeklyMinute)
      };
      
      const currentWeekly = scheduleData.scheduleConfig?.weekly || [];
      updateScheduleData({
        scheduleConfig: {
          ...scheduleData.scheduleConfig,
          type: 'weekly',
          weekly: [...currentWeekly, newWeeklySchedule]
        }
      });
      
      const dayLabel = daysOfWeek.find(d => d.id === weeklyDay)?.label || weeklyDay;
      toast({
        title: "Weekly Schedule Added",
        description: `Posts will be published on ${dayLabel} at ${weeklyHour}:${weeklyMinute}`,
        variant: "success"
      });
    } catch (error) {
      console.error('Error adding weekly schedule:', error);
      toast({
        title: "Error",
        description: "Failed to add weekly schedule",
        variant: "destructive"
      });
    }
  }, [weeklyDay, weeklyHour, weeklyMinute, scheduleData, updateScheduleData, toast]);

  const addMonthlySchedule = useCallback(() => {
    try {
      const newMonthlySchedule = {
        dayOfMonth: parseInt(monthlyDay),
        hour: parseInt(monthlyHour),
        minute: parseInt(monthlyMinute)
      };
      
      const currentMonthly = scheduleData.scheduleConfig?.monthly || [];
      updateScheduleData({
        scheduleConfig: {
          ...scheduleData.scheduleConfig,
          type: 'monthly',
          monthly: [...currentMonthly, newMonthlySchedule]
        }
      });
      
      toast({
        title: "Monthly Schedule Added",
        description: `Posts will be published on day ${monthlyDay} at ${monthlyHour}:${monthlyMinute}`,
        variant: "success"
      });
    } catch (error) {
      console.error('Error adding monthly schedule:', error);
      toast({
        title: "Error",
        description: "Failed to add monthly schedule",
        variant: "destructive"
      });
    }
  }, [monthlyDay, monthlyHour, monthlyMinute, scheduleData, updateScheduleData, toast]);

  const removeDailySchedule = useCallback((index: number) => {
    try {
      const currentDaily = scheduleData.scheduleConfig?.daily || [];
      const newDaily = currentDaily.filter((_, i) => i !== index);
      updateScheduleData({
        scheduleConfig: {
          ...scheduleData.scheduleConfig,
          daily: newDaily
        }
      });
      toast({
        title: "Daily Schedule Removed",
        description: "Schedule has been removed successfully",
        variant: "success"
      });
    } catch (error) {
      console.error('Error removing daily schedule:', error);
    }
  }, [scheduleData, updateScheduleData, toast]);

  const removeWeeklySchedule = useCallback((index: number) => {
    try {
      const currentWeekly = scheduleData.scheduleConfig?.weekly || [];
      const newWeekly = currentWeekly.filter((_, i) => i !== index);
      updateScheduleData({
        scheduleConfig: {
          ...scheduleData.scheduleConfig,
          weekly: newWeekly
        }
      });
      toast({
        title: "Weekly Schedule Removed",
        description: "Schedule has been removed successfully",
        variant: "success"
      });
    } catch (error) {
      console.error('Error removing weekly schedule:', error);
    }
  }, [scheduleData, updateScheduleData, toast]);

  const removeMonthlySchedule = useCallback((index: number) => {
    try {
      const currentMonthly = scheduleData.scheduleConfig?.monthly || [];
      const newMonthly = currentMonthly.filter((_, i) => i !== index);
      updateScheduleData({
        scheduleConfig: {
          ...scheduleData.scheduleConfig,
          monthly: newMonthly
        }
      });
      toast({
        title: "Monthly Schedule Removed",
        description: "Schedule has been removed successfully",
        variant: "success"
      });
    } catch (error) {
      console.error('Error removing monthly schedule:', error);
    }
  }, [scheduleData, updateScheduleData, toast]);

  return (
    <div className="space-y-6">
      <Card className="modern-card">
        <CardHeader>
          <CardTitle className="text-standard">Schedule Configuration</CardTitle>
          <CardDescription className="text-muted">
            Set up when and how often your posts should be published
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Configuration */}
            <div className="space-y-8">
              {/* Post Just Once Checkbox */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-800">
                  <Checkbox
                    id="post-just-once"
                    checked={postJustOnce}
                    onCheckedChange={(checked) => setPostJustOnce(!!checked)}
                    className="w-5 h-5"
                  />
                  <label htmlFor="post-just-once" className="text-sm font-medium text-purple-700 dark:text-purple-300 cursor-pointer">
                    Post just once
                  </label>
                  <div className="text-xs text-purple-600 dark:text-purple-400 ml-2">
                    {postJustOnce ? "Limited to 1 calendar schedule" : "All schedule types available"}
                  </div>
                </div>

                {/* Post Immediately Checkbox - Only show when "Post just once" is checked */}
                {postJustOnce && (
                  <div className="flex items-center space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800 ml-6">
                    <Checkbox
                      id="post-immediately"
                      checked={postImmediately}
                      onCheckedChange={(checked) => setPostImmediately(!!checked)}
                      className="w-4 h-4"
                    />
                    <label htmlFor="post-immediately" className="text-sm font-medium text-orange-700 dark:text-orange-300 cursor-pointer">
                      Post immediately in the end of this post. (Not scheduled)
                    </label>
                  </div>
                )}
              </div>

              {/* Daily Schedule - Hidden when Post Just Once is checked */}
              {!postJustOnce && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-standard">Daily Schedule</h3>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-standard">Time:</span>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={dailyHour}
                      onChange={(e) => setDailyHour(e.target.value.padStart(2, '0'))}
                      className="w-16 px-2 py-1 border rounded text-center"
                      placeholder="09"
                    />
                    <span className="text-standard">:</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      step="5"
                      value={dailyMinute}
                      onChange={(e) => setDailyMinute(e.target.value.padStart(2, '0'))}
                      className="w-16 px-2 py-1 border rounded text-center"
                      placeholder="00"
                    />
                    <Button onClick={addDailySchedule} size="sm" className="bg-gradient-to-r from-blue-800 to-blue-600 hover:from-blue-900 hover:to-blue-700 text-white">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Daily
                    </Button>
                  </div>
                </div>
              )}

              {/* Weekly Schedule - Hidden when Post Just Once is checked */}
              {!postJustOnce && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-standard">Weekly Schedule</h3>
                  <div className="flex items-center space-x-4">
                    <select
                      value={weeklyDay}
                      onChange={(e) => setWeeklyDay(e.target.value)}
                      className="w-32 px-2 py-1 border rounded bg-white dark:bg-gray-800 dark:border-gray-600"
                    >
                      {daysOfWeek.map((day) => (
                        <option key={day.id} value={day.id}>
                          {day.label}
                        </option>
                      ))}
                    </select>
                    <span className="text-sm font-medium text-standard">Time:</span>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={weeklyHour}
                      onChange={(e) => setWeeklyHour(e.target.value.padStart(2, '0'))}
                      className="w-16 px-2 py-1 border rounded text-center"
                      placeholder="09"
                    />
                    <span className="text-standard">:</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      step="5"
                      value={weeklyMinute}
                      onChange={(e) => setWeeklyMinute(e.target.value.padStart(2, '0'))}
                      className="w-16 px-2 py-1 border rounded text-center"
                      placeholder="00"
                    />
                    <Button onClick={addWeeklySchedule} size="sm" className="bg-gradient-to-r from-green-800 to-green-600 hover:from-green-900 hover:to-green-700 text-white">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Weekly
                    </Button>
                  </div>
                </div>
              )}

              {/* Monthly Schedule - Hidden when Post Just Once is checked */}
              {!postJustOnce && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-standard">Monthly Schedule</h3>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-standard">Day:</span>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={monthlyDay}
                      onChange={(e) => setMonthlyDay(e.target.value)}
                      className="w-16 px-2 py-1 border rounded text-center"
                      placeholder="1"
                    />
                    <span className="text-sm font-medium text-standard">Time:</span>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={monthlyHour}
                      onChange={(e) => setMonthlyHour(e.target.value.padStart(2, '0'))}
                      className="w-16 px-2 py-1 border rounded text-center"
                      placeholder="09"
                    />
                    <span className="text-standard">:</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      step="5"
                      value={monthlyMinute}
                      onChange={(e) => setMonthlyMinute(e.target.value.padStart(2, '0'))}
                      className="w-16 px-2 py-1 border rounded text-center"
                      placeholder="00"
                    />
                    <Button onClick={addMonthlySchedule} size="sm" className="bg-gradient-to-r from-yellow-700 to-yellow-500 hover:from-yellow-800 hover:to-yellow-600 text-white">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Monthly
                    </Button>
                  </div>
                </div>
              )}

              {/* Calendar Schedule - Hidden when Post immediately is checked */}
              {!(postJustOnce && postImmediately) && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-standard">Calendar Schedule</h3>
                  <div className="space-y-4">
                    <Calendar
                      mode="single"
                      selected={currentConfigDate}
                      onSelect={handleCalendarSelect}
                      className="rounded-md border shadow-sm"
                      disabled={(date) => date < new Date()}
                      modifiers={{
                        scheduled: getCurrentCalendarData().selectedDates,
                        configuring: currentConfigDate ? [currentConfigDate] : []
                      }}
                      modifiersStyles={{
                        scheduled: { backgroundColor: '#8B5CF6', color: 'white' },
                        configuring: { backgroundColor: '#F59E0B', color: 'white' }
                      }}
                    />

                    {/* Time Configuration for Selected Date */}
                    {currentConfigDate && (
                      <div className="space-y-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <h4 className="font-medium text-purple-700 dark:text-purple-300">
                          Time Configuration for {currentConfigDate.toLocaleDateString()}
                        </h4>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm font-medium text-standard">Time:</span>
                          <input
                            type="number"
                            min="0"
                            max="23"
                            value={currentConfigTime.hour}
                            onChange={(e) => updateCurrentConfigTime('hour', e.target.value.padStart(2, '0'))}
                            className="w-16 px-2 py-1 border rounded text-center"
                            placeholder="09"
                          />
                          <span className="text-standard">:</span>
                          <input
                            type="number"
                            min="0"
                            max="59"
                            step="5"
                            value={currentConfigTime.minute}
                            onChange={(e) => updateCurrentConfigTime('minute', e.target.value.padStart(2, '0'))}
                            className="w-16 px-2 py-1 border rounded text-center"
                            placeholder="00"
                          />
                          <Button onClick={addCalendarDay} size="sm" className="bg-purple-600 hover:bg-purple-700">
                            <Plus className="h-4 w-4 mr-1" />
                            Add Day
                          </Button>
                          <Button 
                            onClick={() => setCurrentConfigDate(null)} 
                            size="sm" 
                            variant="outline"
                            className="text-gray-600 hover:text-gray-800"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Schedule Summary */}
            <div className="space-y-6">
              <div className="sticky top-0">
                <h3 className="text-lg font-semibold text-standard mb-4">Schedule Summary</h3>
                
                {/* Daily Schedules - Only show when "Post just once" is unchecked */}
                {!postJustOnce && scheduleData.scheduleConfig?.daily && scheduleData.scheduleConfig.daily.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-standard">Daily Schedules</h4>
                    {scheduleData.scheduleConfig.daily.map((schedule, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <span className="text-sm">
                          Daily at {schedule.hour.toString().padStart(2, '0')}:{schedule.minute.toString().padStart(2, '0')}
                        </span>
                        <Button
                          onClick={() => removeDailySchedule(index)}
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Weekly Schedules - Only show when "Post just once" is unchecked */}
                {!postJustOnce && scheduleData.scheduleConfig?.weekly && scheduleData.scheduleConfig.weekly.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-standard">Weekly Schedules</h4>
                    {scheduleData.scheduleConfig.weekly.map((schedule, index) => {
                      const dayLabel = daysOfWeek.find(d => d.id === schedule.dayOfWeek)?.label || schedule.dayOfWeek;
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <span className="text-sm">
                            {dayLabel} at {schedule.hour.toString().padStart(2, '0')}:{schedule.minute.toString().padStart(2, '0')}
                          </span>
                          <Button
                            onClick={() => removeWeeklySchedule(index)}
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Monthly Schedules - Only show when "Post just once" is unchecked */}
                {!postJustOnce && scheduleData.scheduleConfig?.monthly && scheduleData.scheduleConfig.monthly.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-standard">Monthly Schedules</h4>
                    {scheduleData.scheduleConfig.monthly.map((schedule, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <span className="text-sm">
                          Day {schedule.dayOfMonth} at {schedule.hour.toString().padStart(2, '0')}:{schedule.minute.toString().padStart(2, '0')}
                        </span>
                        <Button
                          onClick={() => removeMonthlySchedule(index)}
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Calendar Schedules or Immediate Posting Message */}
                {postJustOnce && postImmediately ? (
                  <div className="space-y-3">
                    <h4 className="font-medium text-standard">Immediate Publishing</h4>
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">
                        This post will be published in the end of these steps when you press confirm on step 7.
                      </p>
                    </div>
                  </div>
                ) : (
                  getCurrentCalendarData().selectedDates.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-standard">Calendar Schedules</h4>
                      {getCurrentCalendarData().selectedDates.map((date, index) => {
                        const dateKey = date.toISOString().split('T')[0];
                        const timeConfig = getCurrentCalendarData().dateTimeConfigs[dateKey];
                        return (
                          <div key={index} className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <span className="text-sm">
                              {date.toLocaleDateString()} at {timeConfig?.hour || '09'}:{timeConfig?.minute || '00'}
                            </span>
                            <Button
                              onClick={() => removeDateConfig(dateKey)}
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )
                )}

                {/* Platform Icons */}
                {scheduleData.platforms && scheduleData.platforms.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-standard">Selected Platforms</h4>
                    <div className="flex flex-wrap gap-2">
                      {scheduleData.platforms.map((platform) => {
                        const config = platformConfigs[platform as keyof typeof platformConfigs];
                        if (!config) return null;
                        const Icon = config.icon;
                        return (
                          <div key={platform} className="flex items-center space-x-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                            <Icon className="h-4 w-4" style={{ color: config.color }} />
                            <span className="text-sm text-standard">{config.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Total Active Schedules */}
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-standard mb-2">Total Active Schedules</h4>
                  <div className="text-2xl font-bold text-purple-600">
                    {postJustOnce && postImmediately
                      ? 1 // Show 1 for immediate posting
                      : postJustOnce 
                        ? (getCurrentCalendarData().selectedDates.length || 0) // Only count calendar schedules when "Post just once" is checked
                        : (scheduleData.scheduleConfig?.daily?.length || 0) + 
                          (scheduleData.scheduleConfig?.weekly?.length || 0) + 
                          (scheduleData.scheduleConfig?.monthly?.length || 0) + 
                          (getCurrentCalendarData().selectedDates.length || 0) // Count all schedules when "Post just once" is unchecked
                    }
                  </div>
                  <p className="text-sm text-muted mt-1">
                    {postJustOnce && postImmediately 
                      ? "Immediate posting (no schedule)" 
                      : postJustOnce 
                        ? "One-time posting schedule" 
                        : "Configured posting schedules"
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}