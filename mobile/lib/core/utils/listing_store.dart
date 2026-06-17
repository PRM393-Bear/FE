import '../../features/listing/data/listing_model.dart';

class ListingStore {
  ListingStore._();

  static final ListingStore instance = ListingStore._();

  // Danh sách bài đăng của user
  final List<ListingModel> myListings = [];

  void addListing(ListingModel listing) {
    myListings.insert(0, listing); // thêm vào đầu danh sách
  }
}