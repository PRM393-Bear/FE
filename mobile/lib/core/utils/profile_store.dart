import '../../features/profile/data/profile_model.dart';

class ProfileStore {
  ProfileStore._();

  static final ProfileStore instance = ProfileStore._();

  ProfileModel profile = const ProfileModel(
    name: 'Minh Anh',
    phone: '090 123 4567',
    email: 'minhanh@email.com',
    bio: 'Yêu thời trang bền vững và phong cách vintage.',
    rating: 4.8,
    ratingCount: 32,
    sold: 15,
    bought: 8,
    donated: 23,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    coverUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800',
    addresses: [
      AddressModel(
        label: 'Nhà riêng',
        address: '123 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
        isDefault: true,
      ),
      AddressModel(
        label: 'Văn phòng',
        address: 'Toà nhà Bitexco, 02 Hải Triều, Quận 1, TP. Hồ Chí Minh',
        isDefault: false,
      ),
    ],
  );

  void updateProfile(ProfileModel updated) {
    profile = updated;
  }
}
