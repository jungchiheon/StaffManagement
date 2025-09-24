import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
  StatusBar
} from 'react-native';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [currentScreen, setCurrentScreen] = useState('main');
  
  // 출퇴근 상태
  const [isWorking, setIsWorking] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // 탭 상태
  const [statsTab, setStatsTab] = useState('records');
  const [salesTab, setSalesTab] = useState('today');
  
  // 출퇴근 기록
  const [attendanceRecords, setAttendanceRecords] = useState([
    { id: 1, date: '2024-01-18', checkIn: '09:00', checkOut: '18:30', hours: 9.5 },
    { id: 2, date: '2024-01-19', checkIn: '09:15', checkOut: '19:00', hours: 9.75 },
    { id: 3, date: '2024-01-20', checkIn: '08:45', checkOut: '18:00', hours: 9.25 },
  ]);
  
  // 매출/건수 데이터
  const [salesData] = useState({
    today: { sales: 850000, count: 23 },
    week: { sales: 4500000, count: 142 },
    month: { sales: 18500000, count: 580 },
  });

  // 시계 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = () => {
    if (username === 'admin' && password === '1234') {
      setIsLoggedIn(true);
    } else {
      Alert.alert('로그인 실패', '아이디: admin\n비밀번호: 1234');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '로그아웃', 
          style: 'destructive',
          onPress: () => {
            setIsLoggedIn(false);
            setUsername('');
            setPassword('');
            setCurrentScreen('main');
            setIsWorking(false);
            setCheckInTime(null);
          }
        }
      ]
    );
  };

  const handleCheckIn = () => {
    Alert.alert(
      '출근',
      '출근 처리하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '출근', 
          onPress: () => {
            const now = new Date();
            setIsWorking(true);
            setCheckInTime(now);
          }
        }
      ]
    );
  };

  const handleCheckOut = () => {
    Alert.alert(
      '퇴근',
      '퇴근 처리하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '퇴근',
          style: 'destructive',
          onPress: () => {
            const now = new Date();
            const hours = checkInTime ? (now - checkInTime) / 3600000 : 0;
            
            const newRecord = {
              id: attendanceRecords.length + 1,
              date: now.toLocaleDateString('ko-KR'),
              checkIn: formatTime(checkInTime),
              checkOut: formatTime(now),
              hours: Math.round(hours * 100) / 100
            };
            
            setAttendanceRecords([newRecord, ...attendanceRecords]);
            setIsWorking(false);
            setCheckInTime(null);
          }
        }
      ]
    );
  };

  const formatTime = (date) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const calculateWorkTime = () => {
    if (!checkInTime || !isWorking) return '0시간 0분';
    const diff = currentTime - checkInTime;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}시간 ${minutes}분`;
  };

  const calculateStats = (period) => {
    let recordsToCount = [];
    
    if (period === 'day') {
      recordsToCount = attendanceRecords.slice(0, 1);
    } else if (period === 'week') {
      recordsToCount = attendanceRecords.slice(0, 7);
    } else if (period === 'month') {
      recordsToCount = attendanceRecords;
    }
    
    const totalHours = recordsToCount.reduce((sum, record) => sum + record.hours, 0);
    const avgHours = recordsToCount.length > 0 ? totalHours / recordsToCount.length : 0;
    
    return {
      total: totalHours.toFixed(1),
      average: avgHours.toFixed(1),
      days: recordsToCount.length
    };
  };

  // 로그인 화면
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loginContainer}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoTitle}>Staff Manager</Text>
            <Text style={styles.logoSubtitle}>직원 관리 시스템</Text>
          </View>
          
          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>아이디</Text>
              <TextInput
                style={styles.input}
                placeholder="아이디를 입력하세요"
                placeholderTextColor="#C7C7CC"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>비밀번호</Text>
              <TextInput
                style={styles.input}
                placeholder="비밀번호를 입력하세요"
                placeholderTextColor="#C7C7CC"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCorrect={false}
              />
            </View>
            
            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={handleLogin}
              activeOpacity={0.7}
            >
              <Text style={styles.loginButtonText}>로그인</Text>
            </TouchableOpacity>
            
            <Text style={styles.helpText}>
              테스트 계정: admin / 1234
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // 출퇴근 화면
  if (currentScreen === 'attendance') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        <View style={styles.navBar}>
          <TouchableOpacity 
            onPress={() => setCurrentScreen('main')}
            style={styles.navButton}
          >
            <Text style={styles.navButtonText}>‹ 뒤로</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>출퇴근</Text>
          <View style={styles.navButton} />
        </View>

        <View style={styles.tabBar}>
          <TouchableOpacity 
            style={[styles.tab, statsTab === 'records' && styles.activeTab]}
            onPress={() => setStatsTab('records')}
          >
            <Text style={[styles.tabText, statsTab === 'records' && styles.activeTabText]}>
              출퇴근
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, statsTab === 'stats' && styles.activeTab]}
            onPress={() => setStatsTab('stats')}
          >
            <Text style={[styles.tabText, statsTab === 'stats' && styles.activeTabText]}>
              통계
            </Text>
          </TouchableOpacity>
        </View>

        {statsTab === 'records' ? (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.currentStatusCard}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>현재 상태</Text>
                <View style={[styles.statusBadge, isWorking ? styles.working : styles.notWorking]}>
                  <Text style={styles.statusBadgeText}>
                    {isWorking ? '근무중' : '근무종료'}
                  </Text>
                </View>
              </View>
              
              {isWorking && (
                <>
                  <Text style={styles.workingTimeLabel}>근무 시간</Text>
                  <Text style={styles.workingTimeValue}>{calculateWorkTime()}</Text>
                  <Text style={styles.checkInTimeText}>
                    출근: {formatTime(checkInTime)}
                  </Text>
                </>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.actionButton,
                isWorking ? styles.checkOutBtn : styles.checkInBtn
              ]}
              onPress={isWorking ? handleCheckOut : handleCheckIn}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>
                {isWorking ? '퇴근하기' : '출근하기'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>최근 출퇴근 기록</Text>
            {attendanceRecords.map(record => (
              <View key={record.id} style={styles.recordCard}>
                <Text style={styles.recordDate}>{record.date}</Text>
                <View style={styles.recordTimes}>
                  <Text style={styles.recordTime}>출근: {record.checkIn}</Text>
                  <Text style={styles.recordTime}>퇴근: {record.checkOut}</Text>
                  <Text style={styles.recordHours}>{record.hours}시간</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statPeriod}>일간</Text>
                <Text style={styles.statValue}>{calculateStats('day').total}시간</Text>
                <Text style={styles.statSubtext}>평균: {calculateStats('day').average}시간</Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statPeriod}>주간</Text>
                <Text style={styles.statValue}>{calculateStats('week').total}시간</Text>
                <Text style={styles.statSubtext}>
                  {calculateStats('week').days}일 근무
                </Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statPeriod}>월간</Text>
                <Text style={styles.statValue}>{calculateStats('month').total}시간</Text>
                <Text style={styles.statSubtext}>
                  평균: {calculateStats('month').average}시간/일
                </Text>
              </View>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    );
  }

  // 매출/건수 화면
  if (currentScreen === 'sales') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        <View style={styles.navBar}>
          <TouchableOpacity 
            onPress={() => setCurrentScreen('main')}
            style={styles.navButton}
          >
            <Text style={styles.navButtonText}>‹ 뒤로</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>매출/건수</Text>
          <View style={styles.navButton} />
        </View>

        <View style={styles.periodTabs}>
          <TouchableOpacity 
            style={[styles.periodTab, salesTab === 'today' && styles.activePeriodTab]}
            onPress={() => setSalesTab('today')}
          >
            <Text style={[styles.periodTabText, salesTab === 'today' && styles.activePeriodTabText]}>
              오늘
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.periodTab, salesTab === 'week' && styles.activePeriodTab]}
            onPress={() => setSalesTab('week')}
          >
            <Text style={[styles.periodTabText, salesTab === 'week' && styles.activePeriodTabText]}>
              이번주
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.periodTab, salesTab === 'month' && styles.activePeriodTab]}
            onPress={() => setSalesTab('month')}
          >
            <Text style={[styles.periodTabText, salesTab === 'month' && styles.activePeriodTabText]}>
              이번달
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.salesCard}>
            <View style={styles.salesHeader}>
              <Text style={styles.salesPeriodText}>
                {salesTab === 'today' ? '오늘' : salesTab === 'week' ? '이번 주' : '이번 달'}
              </Text>
            </View>

            <View style={styles.salesInfo}>
              <View style={styles.salesItem}>
                <Text style={styles.salesLabel}>매출</Text>
                <Text style={styles.salesValue}>
                  ₩{salesData[salesTab].sales.toLocaleString()}
                </Text>
              </View>
              
              <View style={styles.salesDivider} />
              
              <View style={styles.salesItem}>
                <Text style={styles.salesLabel}>건수</Text>
                <Text style={styles.salesValue}>
                  {salesData[salesTab].count}건
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 메인 화면
return (
  <SafeAreaView style={styles.container}>
    <StatusBar barStyle="light-content" />
    
    <View style={styles.mainHeader}>
      <View>
        <Text style={styles.greeting}>안녕하세요</Text>
        <Text style={styles.userName}>{username}님</Text>
      </View>
      <TouchableOpacity 
        onPress={handleLogout}
        style={styles.logoutButton}
      >
        <Text style={styles.logoutButtonText}>로그아웃</Text>
      </TouchableOpacity>
    </View>

    <View style={styles.statusBar}>
      <View style={styles.statusItem}>
        <Text style={styles.statusIcon}>{isWorking ? '🟢' : '⭕'}</Text>
        <Text style={styles.statusText}>
          {isWorking ? '근무중' : '근무종료'}
        </Text>
      </View>
      {isWorking && (
        <Text style={styles.workTimeText}>{calculateWorkTime()}</Text>
      )}
    </View>

    <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.menuRow}>
        <TouchableOpacity 
          style={[styles.menuCard, styles.menuCardLarge]}
          onPress={() => setCurrentScreen('attendance')}
          activeOpacity={0.7}
        >
          <Text style={styles.menuEmoji}>⏰</Text>
          <Text style={styles.menuTitle}>출퇴근</Text>
          <Text style={styles.menuDescription}>출퇴근 기록 관리</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menuRow}>
        <TouchableOpacity 
          style={styles.menuCard}
          onPress={() => setCurrentScreen('sales')}
          activeOpacity={0.7}
        >
          <Text style={styles.menuEmoji}>💰</Text>
          <Text style={styles.menuTitle}>매출/건수</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuCard}
          onPress={() => Alert.alert('준비중', '곧 업데이트 예정입니다')}
          activeOpacity={0.7}
        >
          <Text style={styles.menuEmoji}>📅</Text>
          <Text style={styles.menuTitle}>스케줄</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menuRow}>
        <TouchableOpacity 
          style={styles.menuCard}
          onPress={() => Alert.alert('준비중', '곧 업데이트 예정입니다')}
          activeOpacity={0.7}
        >
          <Text style={styles.menuEmoji}>📞</Text>
          <Text style={styles.menuTitle}>호출</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuCard}
          onPress={() => Alert.alert('준비중', '곧 업데이트 예정입니다')}
          activeOpacity={0.7}
        >
          <Text style={styles.menuEmoji}>🏪</Text>
          <Text style={styles.menuTitle}>가게</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menuRow}>
        <TouchableOpacity 
          style={[styles.menuCard, styles.menuCardWide]}
          onPress={() => Alert.alert('준비중', '곧 업데이트 예정입니다')}
          activeOpacity={0.7}
        >
          <Text style={styles.menuEmoji}>🏆</Text>
          <Text style={styles.menuTitle}>랭킹</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  </SafeAreaView>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loginContainer: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  logoSubtitle: {
    fontSize: 17,
    color: '#8E8E93',
  },
  formContainer: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 8,
    marginLeft: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 17,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  loginButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  helpText: {
    textAlign: 'center',
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 20,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  navButton: {
    width: 60,
  },
  navButtonText: {
    color: '#007AFF',
    fontSize: 17,
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  mainHeader: {
    backgroundColor: '#007AFF',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  greeting: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statusBar: {
    backgroundColor: '#FFFFFF',
    marginTop: -15,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  workTimeText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  menuContainer: {
    flex: 1,
    padding: 20,
  },
  menuRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  menuCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  menuCardLarge: {
    paddingVertical: 30,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  menuDescription: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  currentStatusCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  working: {
    backgroundColor: '#34C759',
  },
  notWorking: {
    backgroundColor: '#8E8E93',
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  workingTimeLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  workingTimeValue: {
    fontSize: 28,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  checkInTimeText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  actionButton: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  checkInBtn: {
    backgroundColor: '#34C759',
  },
  checkOutBtn: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  recordCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recordDate: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  recordTimes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recordTime: {
    fontSize: 14,
    color: '#8E8E93',
  },
  recordHours: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  statsContainer: {
    padding: 20,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statPeriod: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 14,
    color: '#8E8E93',
  },
  periodTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  periodTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  activePeriodTab: {
    backgroundColor: '#007AFF',
  },
  periodTabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activePeriodTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  salesCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  salesHeader: {
    marginBottom: 20,
  },
  salesPeriodText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  salesInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  salesItem: {
    alignItems: 'center',
    flex: 1,
  },
  salesLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  salesValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },
  salesDivider: {
    width: 1,
    backgroundColor: '#E5E5EA',
  },
  menuEmoji: {
  fontSize: 32,
  marginBottom: 8,
  },
  menuCardWide: {
    flex: 1,
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 8,
  },
});