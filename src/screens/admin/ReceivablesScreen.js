const ReceivablesScreen = ({ navigation }) => {
  const [receivables, setReceivables] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // 임시 데이터
  const [users] = useState([
    { id: '1', name: '김직원' },
    { id: '2', name: '이직원' },
    { id: '3', name: '박직원' },
  ]);

  const [stores] = useState([
    { id: '1', name: '강남점' },
    { id: '2', name: '홍대점' },
    { id: '3', name: '신촌점' },
  ]);

  useEffect(() => {
    loadReceivables();
  }, [selectedFilter]);

  const loadReceivables = async () => {
    // TODO: Firebase에서 미수금 데이터 로드
    const tempData = [
      {
        id: '1',
        userName: '김직원',
        userId: '1',
        storeName: '강남점',
        storeId: '1',
        amount: 500000,
        description: '1월 급여 미지급',
        createdAt: '2024-01-15',
        isPaid: false,
      },
      {
        id: '2',
        userName: '이직원',
        userId: '2',
        storeName: '홍대점',
        storeId: '2',
        amount: 300000,
        description: '12월 보너스',
        createdAt: '2024-01-10',
        isPaid: false,
      },
      {
        id: '3',
        userName: '박직원',
        userId: '3',
        storeName: '신촌점',
        storeId: '3',
        amount: 200000,
        description: '교통비',
        createdAt: '2024-01-05',
        isPaid: true,
        paidAt: '2024-01-18',
      },
    ];

    let filtered = tempData;
    if (selectedFilter === 'unpaid') {
      filtered = tempData.filter(item => !item.isPaid);
    } else if (selectedFilter === 'paid') {
      filtered = tempData.filter(item => item.isPaid);
    }

    setReceivables(filtered);
  };

  const handleAddReceivable = async () => {
    if (!selectedUser || !selectedStore || !amount || !description) {
      Alert.alert('알림', '모든 항목을 입력해주세요.');
      return;
    }

    try {
      // TODO: Firebase에 미수금 추가
      const newReceivable = {
        userId: selectedUser.id,
        userName: selectedUser.name,
        storeId: selectedStore.id,
        storeName: selectedStore.name,
        amount: parseInt(amount),
        description,
        createdAt: new Date().toISOString(),
        isPaid: false,
      };

      Alert.alert('성공', '미수금이 등록되었습니다.');
      setModalVisible(false);
      resetForm();
      loadReceivables();
    } catch (error) {
      Alert.alert('오류', '미수금 등록에 실패했습니다.');
    }
  };

  const handleMarkAsPaid = (receivableId, userName) => {
    Alert.alert(
      '지급 완료',
      `${userName}님의 미수금을 지급 완료 처리하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '확인',
          onPress: async () => {
            try {
              // TODO: Firebase에서 지급 완료 처리
              Alert.alert('성공', '지급 완료 처리되었습니다.');
              loadReceivables();
            } catch (error) {
              Alert.alert('오류', '처리에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteReceivable = (receivableId) => {
    Alert.alert(
      '미수금 삭제',
      '이 미수금 기록을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Firebase에서 삭제
              Alert.alert('성공', '미수금이 삭제되었습니다.');
              loadReceivables();
            } catch (error) {
              Alert.alert('오류', '삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setSelectedUser(null);
    setSelectedStore(null);
    setAmount('');
    setDescription('');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReceivables();
    setRefreshing(false);
  };

  const getTotalAmount = () => {
    return receivables
      .filter(item => !item.isPaid)
      .reduce((total, item) => total + item.amount, 0);
  };

  return (
    <View style={styles.receivablesContainer}>
      {/* 통계 카드 */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <Text style={styles.statsTitle}>총 미수금</Text>
          <Text style={styles.statsAmount}>
            ₩{getTotalAmount().toLocaleString()}
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {receivables.filter(item => !item.isPaid).length}
              </Text>
              <Text style={styles.statLabel}>미지급</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {receivables.filter(item => item.isPaid).length}
              </Text>
              <Text style={styles.statLabel}>지급완료</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* 필터 */}
      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={selectedFilter}
          onValueChange={setSelectedFilter}
          buttons={[
            { value: 'all', label: '전체' },
            { value: 'unpaid', label: '미지급' },
            { value: 'paid', label: '지급완료' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      {/* 미수금 목록 */}
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {receivables.map(item => (
          <Card key={item.id} style={styles.receivableCard}>
            <Card.Content>
              <View style={styles.receivableHeader}>
                <View style={styles.receivableInfo}>
                  <Text style={styles.receivableName}>{item.userName}</Text>
                  <Text style={styles.receivableStore}>{item.storeName}</Text>
                </View>
                <Chip
                  style={[
                    styles.statusChip,
                    item.isPaid ? styles.paidChip : styles.unpaidChip,
                  ]}
                  textStyle={styles.statusText}
                >
                  {item.isPaid ? '지급완료' : '미지급'}
                </Chip>
              </View>
              
              <Text style={styles.receivableAmount}>
                ₩{item.amount.toLocaleString()}
              </Text>
              <Text style={styles.receivableDescription}>{item.description}</Text>
              <Text style={styles.receivableDate}>
                등록일: {item.createdAt}
                {item.isPaid && ` | 지급일: ${item.paidAt}`}
              </Text>

              {!item.isPaid && (
                <View style={styles.receivableActions}>
                  <Button
                    mode="contained"
                    onPress={() => handleMarkAsPaid(item.id, item.userName)}
                    style={styles.paidButton}
                    compact
                  >
                    지급완료
                  </Button>
                  <Button
                    mode="text"
                    onPress={() => handleDeleteReceivable(item.id)}
                    textColor={colors.error}
                    compact
                  >
                    삭제
                  </Button>
                </View>
              )}
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      {/* FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      />

      {/* 미수금 추가 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>미수금 추가</Text>
              <IconButton
                icon="close"
                onPress={() => setModalVisible(false)}
              />
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.inputLabel}>직원 선택</Text>
              <View style={styles.chipContainer}>
                {users.map(user => (
                  <Chip
                    key={user.id}
                    selected={selectedUser?.id === user.id}
                    onPress={() => setSelectedUser(user)}
                    style={styles.selectionChip}
                  >
                    {user.name}
                  </Chip>
                ))}
              </View>

              <Text style={styles.inputLabel}>가게 선택</Text>
              <View style={styles.chipContainer}>
                {stores.map(store => (
                  <Chip
                    key={store.id}
                    selected={selectedStore?.id === store.id}
                    onPress={() => setSelectedStore(store)}
                    style={styles.selectionChip}
                  >
                    {store.name}
                  </Chip>
                ))}
              </View>

              <TextInput
                label="금액"
                value={amount}
                onChangeText={setAmount}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
                left={<TextInput.Affix text="₩" />}
              />

              <TextInput
                label="설명"
                value={description}
                onChangeText={setDescription}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                mode="text"
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
                style={styles.cancelButton}
              >
                취소
              </Button>
              <Button
                mode="contained"
                onPress={handleAddReceivable}
                style={styles.saveButton}
              >
                추가
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // RankingScreen 스타일
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  periodContainer: {
    padding: 15,
    backgroundColor: 'white',
  },
  segmentedButtons: {
    marginBottom: 10,
  },
  metricContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  metricChip: {
    marginRight: 10,
  },
  myRankCard: {
    margin: 15,
    elevation: 3,
    backgroundColor: colors.primary,
  },
  myRankTitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  myRankContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  myRankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  myRankNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 10,
  },
  myRankRight: {
    alignItems: 'flex-end',
  },
  myRankValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  myRankPeriod: {
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
  },
  progressBar: {
    marginTop: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  rankingList: {
    flex: 1,
    padding: 15,
  },
  rankCard: {
    marginBottom: 10,
    elevation: 2,
  },
  topRankCard: {
    borderWidth: 2,
    borderColor: colors.warning,
  },
  myRankListCard: {
    backgroundColor: colors.primary + '10',
  },
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankLeft: {
    width: 50,
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  topRankNumber: {
    color: colors.warning,
  },
  rankIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  avatar: {
    marginHorizontal: 15,
  },
  rankInfo: {
    flex: 1,
  },
  rankName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  rankValue: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rankChange: {
    alignItems: 'center',
  },
  changeText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // ReceivablesScreen 스타일
  receivablesContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  statsCard: {
    margin: 15,
    elevation: 3,
    backgroundColor: colors.primary,
  },
  statsTitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  statsAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 20,
  },
  statItem: {
    marginRight: 30,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
  },
  filterContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  receivableCard: {
    marginHorizontal: 15,
    marginBottom: 10,
    elevation: 2,
  },
  receivableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  receivableInfo: {
    flex: 1,
  },
  receivableName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  receivableStore: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusChip: {
    height: 24,
  },
  unpaidChip: {
    backgroundColor: colors.error,
  },
  paidChip: {
    backgroundColor: colors.success,
  },
  statusText: {
    fontSize: 11,
    color: 'white',
  },
  receivableAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
  },
  receivableDescription: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 5,
  },
  receivableDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  receivableActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
    gap: 10,
  },
  paidButton: {
    minWidth: 100,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 10,
    marginTop: 10,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  selectionChip: {
    marginRight: 10,
    marginBottom: 10,
  },
  input: {
    marginBottom: 15,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    marginRight: 10,
  },
  saveButton: {
    minWidth: 100,
  },
});

export { RankingScreen, ReceivablesScreen };