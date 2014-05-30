class UsersController < ApplicationController

  def login
  	@users = User.all
  end

  def classroom
    @user = current_user
    msg = { name: @user.id}
    $redis.publish 'rt-change', msg.to_json
  end

  def create_login_session
    user = User.find_by_name(params[:name])
    cookies.permanent[:name] = user.name
    redirect_to :classroom
  end

end
